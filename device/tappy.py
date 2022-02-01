import RPi.GPIO as GPIO
import soco
import time
from data_model import DataModel
from card_reader import CardReader
from rest_service import RestService
from soco.plugins.sharelink import ShareLinkPlugin  # type: ignore

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

    def cardTapped(self, uid):
        log.info(f"Card read UID: {uid}")
        self.beep()
        cardData = self.dataModel.getCardDetails(uid)
        if cardData == None:
            log.info("no playlist associated with card")
            return
        else:
            url = cardData["url"]
            log.info(f"playing {url}")
        self.setPlaylist(self.dataModel.getCurrentSpeaker(),url)    

    def setPlaylist(self,deviceName,url):
        device = soco.discovery.by_name(deviceName)
        device.stop()
        device.clear_queue()
        share_link = ShareLinkPlugin(device)
        device.shuffle = True
        device.repeat = True
        result = share_link.add_share_link_to_queue(url)
        log.info(result)
        device.play_from_queue(0)

    def beep(self):
        for i in range(1,3):
            GPIO.output(self.buzzer, GPIO.LOW)
            time.sleep(0.01)
            GPIO.output(self.buzzer, GPIO.HIGH)
            time.sleep(0.01)

    def stopPlaying(self,deviceName):
        device = soco.discovery.by_name(deviceName)
        device.stop()
    
    def stop(self):
        self.reader.stopReading()
        self.stopPlaying(self.dataModel.getCurrentSpeaker())
        self.restService.stop()


    def start(self):
        for i in range(1,5):
            self.beep()

        self.restService.start()        
        self.reader.lookForCard()        