from dataclasses import dataclass
from pyclbr import Function
from tokenize import Number
from xmlrpc.client import boolean
import mfrc522 as MFRC522
import logging
import time
log = logging.getLogger(__name__)


kNoCard = 0
kHasCard = 1
kMaybeCard = 2

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
        self.MIFAREReader = MFRC522.MFRC522()
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
            self.config.read(uid,self.readCount)

    def readComplete(self):
        if(self.config.readComplete):
            self.config.readComplete(self.lastUID,self.readCount)
        if (self.config.autoRemove):
            self.readConfig.pop()

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

            self.updateState(status)


