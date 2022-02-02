import mfrc522 as MFRC522
import logging
import time
log = logging.getLogger(__name__)


kNoCard = 0
kHasCard = 1
kMaybeCard = 2


class CardReader:
    def __init__(self,tappy,readCallback):
        self.MIFAREReader = MFRC522.MFRC522()
        self.dataModel = tappy.dataModel
        self.tappy = tappy
        self.readCallback = readCallback
        self.state = kNoCard
        self.continue_reading = True
        self.overrideCallback = None
        self.overrideTimeout = 0
        self.overrideTimestamp = 0
    def stopReading(self):
        self.continue_reading = False

    def overrideReadCallback(self,callback,timeout = 5,beep = True):
        log.info(f"overriding read callback with {timeout} timeout")
        self.overrideTimestamp = time.time()
        self.overrideTimeout = timeout
        self.overrideCallback = callback
        self.overrideBeep = beep

    def readCard(self):
        # Get the UID of the card
        (status,uid) = self.MIFAREReader.MFRC522_Anticoll()

        # If we have the UID, continue
        if status != self.MIFAREReader.MI_OK:
            return
        uid = str(uid[0])+"_"+str(uid[1])+"_"+str(uid[2])+"_"+str(uid[3])
        self.dataModel.registerCardRead(uid)
        if (self.overrideCallback != None):
            log.info("override callback found")
            if(time.time() - self.overrideTimestamp > self.overrideTimeout):
                log.info(f"override callback timed out {time.time() - self.overrideTimestamp} vs {self.overrideTimeout}")
                self.overrideCallback = None
        if (self.overrideCallback != None):
            if self.overrideBeep:
                self.tappy.beep(3)
            self.overrideCallback(uid)
            self.overrideCallback = None
        else:
            self.readCallback(uid)

    def updateState(self,status):
        if(self.state == kNoCard):
            if(status == self.MIFAREReader.MI_OK):
                # SWITCH
                log.info("*** NEW CARD")
                self.state = kHasCard
                self.readCard()
        if(self.state == kMaybeCard):
            if(status == self.MIFAREReader.MI_ERR):
                # SWITCH
                log.info("*** CARD GONE")
                self.state = kNoCard
            else:
                self.state = kHasCard
        if(self.state == kHasCard):
            if(status == self.MIFAREReader.MI_ERR):
                self.state = kMaybeCard            

    def lookForCard(self):

        # This loop keeps checking for chips. If one is near it will get the UID and authenticate
        while self.continue_reading:
            
            # Scan for cards    
            (status,TagType) = self.MIFAREReader.MFRC522_Request(self.MIFAREReader.PICC_REQIDL)

            self.updateState(status)


