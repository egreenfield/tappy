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
        self.reader = CardReader(self.dataModel, lambda uid : self.cardTapped(uid))
        self.restService = RestService(self)
        self.stereo = Stereo(self)

    def cardTapped(self, uid):
        log.info(f"Card read UID: {uid}")
        self.beep()
        self.dataModel.registerCardRead(uid)
        cardData = self.dataModel.getCard(uid)
        if cardData == None:
            log.info("no playlist associated with card")
            return
        else:
            url = cardData["url"]
            log.info(f"playing card {cardData.get('title')}")
        self.stereo.playUrl(self.dataModel.getCurrentSpeaker(),url)    

    def beep(self):
        for i in range(1,3):
            GPIO.output(self.buzzer, GPIO.LOW)
            time.sleep(0.01)
            GPIO.output(self.buzzer, GPIO.HIGH)
            time.sleep(0.01)
    
    def stop(self):
        self.reader.stopReading()
        self.stereo.stopPlaying(self.dataModel.getCurrentSpeaker())
        self.restService.stop()
        GPIO.cleanup()


    def start(self):
        for i in range(1,5):
            self.beep()

        self.restService.start()        
        self.reader.lookForCard()        
