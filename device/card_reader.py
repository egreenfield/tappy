import mfrc522 as MFRC522
import RPi.GPIO as GPIO


kNoCard = 0
kHasCard = 1
kMaybeCard = 2


class CardReader:
    def __init__(self,dataModel,readCallback):
        self.MIFAREReader = MFRC522.MFRC522()
        self.dataModel = dataModel
        self.readCallback = readCallback
        self.state = kNoCard
        self.continue_reading = True

    def stopReading(self):
        self.continue_reading = False
        
    def readCard(self):
        # Get the UID of the card
        (status,uid) = self.MIFAREReader.MFRC522_Anticoll()

        # If we have the UID, continue
        if status == self.MIFAREReader.MI_OK:
            # Print UID
            uid = str(uid[0])+"_"+str(uid[1])+"_"+str(uid[2])+"_"+str(uid[3])
            self.readCallback(uid)

    def updateState(self,status):
        if(self.state == kNoCard):
            if(status == self.MIFAREReader.MI_OK):
                # SWITCH
                print("*** NEW CARD")
                self.state = kHasCard
                self.readCard()
        if(self.state == kMaybeCard):
            if(status == self.MIFAREReader.MI_ERR):
                # SWITCH
                print("*** CARD GONE")
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

