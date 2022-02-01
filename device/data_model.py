from os import path
import json
import logging
log = logging.getLogger(__name__)

class DataModel:
    def __init__(self):
        self.configPath = path.join(path.dirname(path.abspath(__file__)),"../config.json")
        self.loadConfig()

    def getCardDetails(self,uid):
        return self.config['cards'].get(uid)

    def getCurrentSpeaker(self):
        return self.config['speaker']

    def updateCardData(self,uid,newCardData,merge=True):
        if(merge):
            cardData = self.config['cards'].get(uid) or {}
            for aProp in newCardData:
                if aProp == "details":
                    newDetails = newCardData["details"]
                    oldDetails = cardData.get("details") or {}
                    for aDetail in newDetails:
                        oldDetails[aDetail] = newDetails[aDetail]
                cardData[aProp] = newCardData[aProp]
            self.config['cards'][uid] = cardData
        else:
            self.config['cards'][uid] = newCardData
        self.autoSave()

    def loadConfig(self):
        file = open(self.configPath)
        self.config = json.load(file)
        log.info(f"loaded cardmap as {self.config['cards']}")

    def saveConfig(self):
        with open(self.configPath, 'w') as outfile:
            json.dump(self.config, outfile,indent=4)
    def autoSave(self):
        self.saveConfig()
