import RPi.GPIO as GPIO
import time
from data_model import DataModel
from card_reader import CardReader
from rest_service import RestService
from stereo import Stereo

import logging
log = logging.getLogger(__name__)

class Tappy:
    def __init__(self):
        self.buzzer = 26
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.buzzer, GPIO.OUT)
        GPIO.output(self.buzzer, GPIO.HIGH)

        self.dataModel = DataModel()
        self.reader = CardReader(self, lambda uid : self.cardTapped(uid))
        self.restService = RestService(self)
        self.stereo = Stereo(self)

    def cardTapped(self, uid):
        log.info(f"Card read UID: {uid}")
        self.beep(1)
        self.dataModel.registerCardRead(uid)
        cardData = self.dataModel.getCard(uid)
        if cardData == None:
            log.info("no playlist associated with card")
            return
        else:
            url = cardData["url"]
            log.info(f"playing card {cardData.get('title')}")
        self.stereo.playUrl(self.dataModel.getCurrentSpeaker(),url)    

    def beep(self,count = 1,length=0.01,delay = 0.01):
        for i in range(1,1+count):
            GPIO.output(self.buzzer, GPIO.LOW)
            time.sleep(length)
            GPIO.output(self.buzzer, GPIO.HIGH)
            time.sleep(delay)
    
    def stop(self):
        self.reader.stopReading()
        self.stereo.stopPlaying(self.dataModel.getCurrentSpeaker())
        self.restService.stop()
        GPIO.cleanup()


    def start(self):
        for i in range(1,5):
            self.beep(5)

        self.restService.start()        
        self.reader.lookForCard()        
