from dataclasses import dataclass
from pyclbr import Function
from tokenize import Number
from xmlrpc.client import boolean
import mfrc522 as MFRC522
import RPi.GPIO as GPIO
import logging
import time
log = logging.getLogger(__name__)


kNoCard = 0
kHasCard = 1
kMaybeCard = 2


class _MFRC522(MFRC522.MFRC522):
    """mfrc522's MFRC522_ToCard has a broken wait-loop condition that never reacts to the reader's
    timer interrupt, so every poll with no card present spins through 2000 SPI reads (~200ms of
    CPU on a Pi Zero). This is the same routine with the loop fixed to stop on the timer IRQ
    (no card) or the command IRQ (answer received)."""

    def MFRC522_ToCard(self, command, sendData):
        backData = []
        backLen = 0
        status = self.MI_ERR
        irqEn = 0x00
        waitIRq = 0x00
        if command == self.PCD_AUTHENT:
            irqEn = 0x12
            waitIRq = 0x10
        if command == self.PCD_TRANSCEIVE:
            irqEn = 0x77
            waitIRq = 0x30

        self.Write_MFRC522(self.CommIEnReg, irqEn | 0x80)
        self.ClearBitMask(self.CommIrqReg, 0x80)
        self.SetBitMask(self.FIFOLevelReg, 0x80)
        self.Write_MFRC522(self.CommandReg, self.PCD_IDLE)
        for byte in sendData:
            self.Write_MFRC522(self.FIFODataReg, byte)
        self.Write_MFRC522(self.CommandReg, command)
        if command == self.PCD_TRANSCEIVE:
            self.SetBitMask(self.BitFramingReg, 0x80)

        i = 2000
        while True:
            n = self.Read_MFRC522(self.CommIrqReg)
            i -= 1
            if i == 0 or (n & 0x01) or (n & waitIRq):   # timer expired, or command finished
                break

        self.ClearBitMask(self.BitFramingReg, 0x80)

        if i != 0:
            if (self.Read_MFRC522(self.ErrorReg) & 0x1B) == 0x00:
                status = self.MI_OK
                if n & irqEn & 0x01:
                    status = self.MI_NOTAGERR
                if command == self.PCD_TRANSCEIVE:
                    n = self.Read_MFRC522(self.FIFOLevelReg)
                    lastBits = self.Read_MFRC522(self.ControlReg) & 0x07
                    backLen = (n - 1) * 8 + lastBits if lastBits != 0 else n * 8
                    n = max(1, min(n, self.MAX_LEN))
                    for _ in range(n):
                        backData.append(self.Read_MFRC522(self.FIFODataReg))
            else:
                status = self.MI_ERR
        return (status, backData, backLen)

# Pause between reader polls. Each poll burns ~25ms of CPU inside the MFRC522 library waiting
# for its timer, so without this the loop pins the Pi Zero's only core at 100%.
kPollInterval = 0.2

# The RC522 module's RST line is wired to BCM 25 (board pin 22). With GPIO in BCM mode the
# mfrc522 library wrongly drives BCM 15 instead, so the chip was never hardware-reset: after days
# of uptime its RF front end can wedge (registers look fine, no card is ever detected) and only a
# pulse on RST recovers it. So we drive RST ourselves, at startup and periodically while idle.
kResetPin = 25
kIdleResetInterval = 30 * 60   # hard-reset the reader after this long without a card
kHealthCheckInterval = 60      # verify the chip still holds its configuration this often
kHeartbeatInterval = 60 * 60   # log poll statistics this often

@dataclass
class ReadConfig:
    read:Function
    readComplete:Function
    timeout:float
    maxReads:int
    beep:boolean
    autoRemove:boolean=False

class CardReader:
    def __init__(self,tappy,readConfig):
        self.lastHealthCheck = time.time()
        self.lastHeartbeat = time.time()
        self.pollCount = 0
        self.okCount = 0
        self.resetCount = 0
        self.MIFAREReader = _MFRC522(pin_rst=kResetPin)   # the library configures the RST pin
        self.hardReset()
        self.dataModel = tappy.dataModel
        self.tappy = tappy
        self.state = kNoCard
        self.continue_reading = True

        self.lastRead = 0
        self.readCount = 0
        self.lastUID = ""
        self.readConfig = [(readConfig,0)]
    
    @property
    def config(self):
        return self.readConfig[-1][0]

    @property
    def callbackTimestamp(self):
        return self.readConfig[-1][1]

    def hardReset(self, reason="startup"):
        """Pulse the reader's RST line and re-run the library's initialisation."""
        log.info(f"hard-resetting card reader ({reason})")
        GPIO.output(kResetPin, GPIO.LOW)
        time.sleep(0.05)
        GPIO.output(kResetPin, GPIO.HIGH)
        time.sleep(0.05)
        self.MIFAREReader.MFRC522_Init()
        self.lastReset = time.time()
        self.resetCount += 1

    def readerHealthy(self):
        """True if the chip still holds the configuration MFRC522_Init gave it."""
        r = self.MIFAREReader
        try:
            version = r.Read_MFRC522(r.VersionReg)
            tmode = r.Read_MFRC522(r.TModeReg)
            antenna = r.Read_MFRC522(r.TxControlReg) & 0x03
        except Exception as e:
            log.warning(f"reader register read failed: {e}")
            return False
        if version not in (0x91, 0x92) or tmode != 0x8D or antenna != 0x03:
            log.warning(f"reader lost its configuration: version={version:02x} tmode={tmode:02x} antenna={antenna:02x}")
            return False
        return True

    def maintain(self):
        """Housekeeping between polls: health check, idle reset, heartbeat."""
        now = time.time()
        if now - self.lastHealthCheck >= kHealthCheckInterval:
            self.lastHealthCheck = now
            if not self.readerHealthy():
                self.hardReset("configuration lost")
        if self.state == kNoCard and now - self.lastReset >= kIdleResetInterval:
            self.hardReset("periodic idle reset")
        if now - self.lastHeartbeat >= kHeartbeatInterval:
            self.lastHeartbeat = now
            log.info(f"heartbeat: polls={self.pollCount} card_seen={self.okCount} resets={self.resetCount} state={self.state}")

    def stopReading(self):
        self.continue_reading = False

    def cancelReadConfig(self):
        if(len(self.readConfig) > 1):
            self.readConfig.pop()
        else:
            log.warn("ERROR: Cancel Read Config called with only the base read config on the stack")

    def pushReadConfig(self,config):
        log.info(f"overriding read callback with {config.timeout} timeout")
        self.readConfig.append((config,time.time()))

    def readCard(self):
        # Get the UID of the card
        (status,uid) = self.MIFAREReader.MFRC522_Anticoll()

        # If we have the UID, continue
        if status != self.MIFAREReader.MI_OK:
            return
        self.lastRead = time.time()
        uid = str(uid[0])+"_"+str(uid[1])+"_"+str(uid[2])+"_"+str(uid[3])
        self.lastUID = uid
        self.dataModel.registerCardRead(uid)
        while self.config.timeout > 0:
            log.info("timeout read config found")
            if(time.time() - self.callbackTimestamp > self.config.timeout):
                log.info(f"override callback timed out {time.time() - self.callbackTimestamp} vs {self.config.timeout}")
                self.readConfig.pop()
            else:
                break
        if self.config.beep:
                self.tappy.beep(3)
        if self.config.read:
            self._callback(self.config.read, uid, self.readCount)

    def readComplete(self):
        if(self.config.readComplete):
            self._callback(self.config.readComplete, self.lastUID, self.readCount)
        if (self.config.autoRemove):
            self.readConfig.pop()

    def _callback(self, fn, uid, readCount):
        # A failing callback (network, Sonos, config...) must never take the read loop down.
        try:
            fn(uid, readCount)
        except Exception:
            log.exception(f"card callback failed for {uid}")

    def checkForContinue(self):
        if(self.readCount >= self.config.maxReads):
            return;

        now = time.time()
        if(now - self.lastRead > 1):
            self.readCount += 1
            self.readCard()

    def updateState(self,status):
        if(self.state == kNoCard):
            if(status == self.MIFAREReader.MI_OK):
                # SWITCH
                log.info("*** NEW CARD")
                self.state = kHasCard
                self.readCount = 1
                self.readCard()
        if(self.state == kMaybeCard):
            if(status == self.MIFAREReader.MI_ERR):
                # SWITCH
                log.info("*** CARD GONE")
                self.readComplete()
                self.state = kNoCard
            else:
                self.state = kHasCard
        if(self.state == kHasCard):
            if(status == self.MIFAREReader.MI_ERR):
                self.state = kMaybeCard            
            else:
                self.checkForContinue()

    def lookForCard(self):

        # This loop keeps checking for chips. If one is near it will get the UID and authenticate
        while self.continue_reading:
            
            # Scan for cards    
            (status,TagType) = self.MIFAREReader.MFRC522_Request(self.MIFAREReader.PICC_REQIDL)
            self.pollCount += 1
            if status == self.MIFAREReader.MI_OK:
                self.okCount += 1

            self.updateState(status)
            self.maintain()
            time.sleep(kPollInterval)


