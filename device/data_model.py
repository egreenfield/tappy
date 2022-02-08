from os import path
import json
import logging
log = logging.getLogger(__name__)

class DataModel:
    def __init__(self):
        self.dbPath = path.join(path.dirname(path.abspath(__file__)),"../config.json")
        self.readCount = 0
        self.loadDB()

    def setBookmark(self,id,content):
        self.db['bookmarks'][id] = content
        self.autoSave()

    def getBookmark(self,id):
        return self.db['bookmarks'].get(id)

    def deleteBookmark(self,id):
        self.db['bookmarks'].pop(id,None);
        self.autoSave()

    def getAllBookmarks(self):
        return dict(self.db['bookmarks'])
    def deleteAllBookmarks(self):
        self.db['bookmarks'] = {}

    def getCard(self,uid):
        data = self.db['cards'].get(uid)
        return None if data == None else dict(data)

    def getAllCards(self):
        # note: should really be doing a deep copy here
        return dict(self.db['cards'])

    def getCurrentSpeakers(self):
        return self.db['speakers']

    def setCurrentSpeakers(self,newSpeakers):
        self.db['speakers'] = newSpeakers
        self.autoSave()

    def registerCardRead(self,id):
        self.db['lastCardRead'] = id
        self.readCount += 1
        self.autoSave()
    
    def getLastCardRead(self):
        return self.db.get('lastCardRead')

    def deleteCardData(self,uid):
        log.info(f"deleting card {uid}")        
        self.db['cards'].pop(uid,None);
        self.autoSave();

    def updateCardData(self,uid,newCardData,merge=True):
        if(merge):
            cardData = self.db['cards'].get(uid) or {}
            for aProp in newCardData:
                if aProp == "details":
                    newDetails = newCardData["details"]
                    oldDetails = cardData.get("details") or {}
                    for aDetail in newDetails:
                        oldDetails[aDetail] = newDetails[aDetail]
                cardData[aProp] = newCardData[aProp]
            self.db['cards'][uid] = cardData
        else:
            self.db['cards'][uid] = newCardData
        self.autoSave()

    def loadDB(self):
        file = open(self.dbPath)
        self.db = json.load(file)
        if(self.db.get('bookmarks') == None):
            self.db['bookmarks'] = {}
        
        #log.info(f"loaded cardmap as {self.db['cards']}")

    def saveDB(self):
        with open(self.dbPath, 'w') as outfile:
            json.dump(self.db, outfile,indent=4)
    def autoSave(self):
        self.saveDB()

