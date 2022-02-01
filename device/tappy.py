import RPi.GPIO as GPIO
import soco
import time
from threading import Thread
from data_model import DataModel
from card_reader import CardReader
from rest_service import RestService
from soco.plugins.sharelink import ShareLinkPlugin  # type: ignore

import logging
log = logging.getLogger(__name__)

class Tappy:
    def __init__(self):
        self.buzzer = 26
        # Create an object of the class MFRC522
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.buzzer, GPIO.OUT)
        GPIO.output(self.buzzer, GPIO.HIGH)

        self.dataModel = DataModel()
        self.reader = CardReader(self.dataModel, lambda uid : self.cardTapped(uid))
        self.restService = RestService(self)

    def cardTapped(self, uid):
        log.info(f"Card read UID: {uid}")
        self.beep()
        url = self.dataModel.cardMap.get(uid)
        if url == None:
            log.info("no playlist associated with card")
            return
        else:
            log.info(f"playing {url}")
        self.setPlaylist(self.dataModel.speaker,url)    

    def setPlaylist(self,deviceName,url):
        device = soco.discovery.by_name(deviceName)
        device.stop()
        device.clear_queue()
        share_link = ShareLinkPlugin(device)
        device.shuffle = True
        device.repeat = True
        log.info(share_link.add_share_link_to_queue(url))
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
        self.stopPlaying(self.dataModel.speaker)

    def start(self):
        for i in range(1,5):
            self.beep()
        
        readerThread = Thread(target=lambda : self.restService.start())
        readerThread.start()
        self.reader.lookForCard()        
