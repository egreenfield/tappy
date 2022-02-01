from os import path
import json
import logging
log = logging.getLogger(__name__)

class DataModel:
    def __init__(self):
        self.configPath = path.join(path.dirname(path.abspath(__file__)),"../config.json")
        self.loadConfig()

    def getCard(self,uid):
        data = self.config['cards'].get(uid)
        return None if data == None else dict(data)

    def getAllCards(self):
        # note: should really be doing a deep copy here
        return dict(self.config['cards'])

    def getCurrentSpeaker(self):
        return self.config['speaker']

    def registerCardRead(self,id):
        self.config['lastCardRead'] = id
        self.autoSave()
    
    def getLastCardRead(self):
        return self.config.get('lastCardRead')


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
        #log.info(f"loaded cardmap as {self.config['cards']}")

    def saveConfig(self):
        with open(self.configPath, 'w') as outfile:
            json.dump(self.config, outfile,indent=4)
    def autoSave(self):
        self.saveConfig()

