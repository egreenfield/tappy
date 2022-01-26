#!/usr/bin/env python
# -*- coding: utf8 -*-

import RPi.GPIO as GPIO
import mfrc522 as MFRC522
import signal
import soco
from soco.plugins.sharelink import ShareLinkPlugin  # type: ignore

cardMap = {}
cardMap["136_4_73_140"] = "https://open.spotify.com/playlist/1BcqUS1Ivi3HHFupnvsAVk?si=f687707dd8154481"
cardMap["136_4_95_158"] = "https://open.spotify.com/playlist/4XelIj6BvMyaJjQWmEKd7l?si=750cbd45d748408a"
cardMap["162_212_47_28"] = "https://open.spotify.com/album/4KJGypBUe7ANibtri1msUe?si=UMWw2HtUTr6Hq9RvsC2MRg"
cardMap["unknown"] = ""


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
    stopPlaying("Study")
    GPIO.cleanup()


def readForCard():
    # Create an object of the class MFRC522
    MIFAREReader = MFRC522.MFRC522()

    # This loop keeps checking for chips. If one is near it will get the UID and authenticate
    while continue_reading:
        
        # Scan for cards    
        (status,TagType) = MIFAREReader.MFRC522_Request(MIFAREReader.PICC_REQIDL)

        # If a card is found
        if status == MIFAREReader.MI_OK:
            print ("Card detected")
        
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
            setPlaylist("Study",url)    


# Hook the SIGINT
signal.signal(signal.SIGINT, end_read)
print ("Press Ctrl-C to stop.")
readForCard()