#!/usr/bin/env python
# -*- coding: utf8 -*-

import RPi.GPIO as GPIO
import mfrc522 as MFRC522
import signal
import soco
import yaml
from soco.plugins.sharelink import ShareLinkPlugin  # type: ignore


kNoCard = 0
kHasCard = 1
kMaybeCard = 2

state = kNoCard

from os import path
albumPath = path.join(path.dirname(path.abspath(__file__)),"config.yaml")
a_yaml_file = open(albumPath)
config = yaml.load(a_yaml_file, Loader=yaml.FullLoader)

cardMap = config["cards"]
speaker = config["speaker"]
cardMap["unknown"] = ""

print(f"cardmap is {cardMap}")

# Create an object of the class MFRC522
MIFAREReader = MFRC522.MFRC522()


def setPlaylist(deviceName,url):
    device = soco.discovery.by_name(deviceName)

    device.stop()

    device.clear_queue()
    share_link = ShareLinkPlugin(device)
    device.shuffle = True
    device.repeat = True
    print(share_link.add_share_link_to_queue(url))
    device.play_from_queue(0)


def stopPlaying(deviceName):
    device = soco.discovery.by_name(deviceName)
    device.stop()

continue_reading = True
# Capture SIGINT for cleanup when the script is aborted
def end_read(signal,frame):
    global continue_reading
    print ("Ctrl+C captured, ending read.")
    continue_reading = False
    stopPlaying(speaker)
    GPIO.cleanup()


def readCard():
    # Get the UID of the card
    (status,uid) = MIFAREReader.MFRC522_Anticoll()

    # If we have the UID, continue
    if status == MIFAREReader.MI_OK:

        # Print UID
        uid = str(uid[0])+"_"+str(uid[1])+"_"+str(uid[2])+"_"+str(uid[3])
        print(f"Card read UID: {uid}")
        url = cardMap.get(uid)
        if url == None:
            print("no playlist associated, playing default")
            url = cardMap["unknown"]
        else:
            print(f"playing {url}")
        setPlaylist(speaker,url)    


def updateState(status):
    global state
    if(state == kNoCard):
        if(status == MIFAREReader.MI_OK):
            # SWITCH
            print("*** NEW CARD")
            state = kHasCard
            readCard()
    if(state == kMaybeCard):
        if(status == MIFAREReader.MI_ERR):
            # SWITCH
            print("*** CARD GONE")
            state = kNoCard
        else:
            state = kHasCard
    if(state == kHasCard):
        if(status == MIFAREReader.MI_ERR):
            state = kMaybeCard            

def lookForCard():

    # This loop keeps checking for chips. If one is near it will get the UID and authenticate
    while continue_reading:
        
        # Scan for cards    
        (status,TagType) = MIFAREReader.MFRC522_Request(MIFAREReader.PICC_REQIDL)

        updateState(status)


# Hook the SIGINT
signal.signal(signal.SIGINT, end_read)
signal.signal(signal.SIGTERM, end_read)
print ("Press Ctrl-C to stop.")
lookForCard()