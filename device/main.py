#!/usr/bin/env python
# -*- coding: utf8 -*-

import RPi.GPIO as GPIO
import signal
import soco
import time
from soco.plugins.sharelink import ShareLinkPlugin  # type: ignore
from data_model import DataModel
from card_reader import CardReader


class Tappy:
    def __init__(self):
        self.buzzer = 26
        # Create an object of the class MFRC522
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.buzzer, GPIO.OUT)
        GPIO.output(self.buzzer, GPIO.HIGH)

        self.dataModel = DataModel()
        self.reader = CardReader(self.dataModel, lambda uid : self.cardTapped(uid))

    def cardTapped(self, uid):
        print(f"Card read UID: {uid}")
        self.beep()
        url = self.dataModel.cardMap.get(uid)
        if url == None:
            print("no playlist associated, playing default")
            url = self.dataModel.cardMap["unknown"]
        else:
            print(f"playing {url}")
        self.setPlaylist(self.dataModel.speaker,url)    

    def setPlaylist(self,deviceName,url):
        device = soco.discovery.by_name(deviceName)
        device.stop()
        device.clear_queue()
        share_link = ShareLinkPlugin(device)
        device.shuffle = True
        device.repeat = True
        print(share_link.add_share_link_to_queue(url))
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
        self.reader.lookForCard()        

tappy = Tappy()

# Capture SIGINT for cleanup when the script is aborted
def end_read(signal,frame):
    global tappy
    print ("Ctrl+C captured, ending.")
    tappy.stop()
    GPIO.cleanup()

# Hook the SIGINT
signal.signal(signal.SIGINT, end_read)
signal.signal(signal.SIGTERM, end_read)
print ("Press Ctrl-C to stop.")
tappy.start()
