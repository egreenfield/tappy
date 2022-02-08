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
        self.buzzerVCC = 22
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.buzzer, GPIO.OUT)
        GPIO.output(self.buzzer, GPIO.HIGH)
        GPIO.setup(self.buzzerVCC, GPIO.OUT)
        GPIO.output(self.buzzerVCC, GPIO.HIGH)

        self.dataModel = DataModel()
        self.reader = CardReader(self, lambda uid : self.cardTapped(uid))
        self.restService = RestService(self)
        self.stereo = Stereo(self)

    def cardTapped(self, uid):
        log.info(f"Card read UID: {uid}")
        cardData = self.dataModel.getCard(uid)
        if cardData == None:
            self.beep(count=2,length=.1)
            log.info("no playlist associated with card")
            return
        else:
            self.beep(1)
            url = cardData["url"]
            log.info(f"playing card {cardData.get('title')}")
        self.stereo.playUrl(self.dataModel.getCurrentSpeakers(),url)    

    def beep(self,count = 1,length=0.01,delay = 0.01):
        for i in range(1,1+count):
            GPIO.output(self.buzzer, GPIO.LOW)
            time.sleep(length)
            GPIO.output(self.buzzer, GPIO.HIGH)
            time.sleep(delay)
    
    def stop(self):
        self.reader.stopReading()
        self.stereo.stopPlaying(self.dataModel.getCurrentSpeakers())
        self.restService.stop()
        GPIO.cleanup()


    def start(self):
        self.beep(count=3,length=.01)
        time.sleep(.1)
        self.beep(count=3,length=.01)
        time.sleep(.1)
        self.beep(count=3,length=.01)

        self.restService.start()        
        self.reader.lookForCard()        
