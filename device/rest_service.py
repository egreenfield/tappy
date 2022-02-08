from random import Random, random
import falcon
import logging
import json
from threading import Thread
from werkzeug.serving import run_simple
from werkzeug.serving import make_server

from card_reader import ReadConfig

log = logging.getLogger(__name__)

def buildLastReadData(dataModel):
    result = {
        "count":dataModel.readCount
    }
    id = dataModel.getLastCardRead()
    if id != None:
        result['id'] = id
        result['content'] = dataModel.getCard(id)
    return result

class LastCardHandler():
    def __init__(self,tappy):
        self.tappy = tappy

    def on_get(self,req,resp):
        result = buildLastReadData(self.tappy.dataModel)
        resultJson = json.dumps(result,indent=4)
        resp.status = falcon.HTTP_200  # This is the default status        
        resp.text = (resultJson)
        resp.content_type = falcon.MEDIA_JSON

class DeviceHandler():
    def __init__(self,tappy):
        self.tappy = tappy

    def on_get(self,req,resp):
        devices = self.tappy.stereo.getDeviceNames()
        active = self.tappy.dataModel.getCurrentSpeakers();

        resultJson = json.dumps({"speakers":devices,"active":active},indent=4)
        resp.status = falcon.HTTP_200  # This is the default status        
        resp.text = (resultJson)
        resp.content_type = falcon.MEDIA_JSON

    
    def on_post_active(self,req,resp):
        eventBody = req.media
        log.info(f'received event: {eventBody}')
        speakerName = eventBody.get("names")
        self.tappy.dataModel.setCurrentSpeakers(speakerName)
        resp.status = falcon.HTTP_200  # This is the default status        
        resp.text = ("{}")
        resp.content_type = falcon.MEDIA_JSON

class CardHandler():
    def __init__(self,tappy):
        self.tappy = tappy

    def on_get(self,req,resp):
        cards = self.tappy.dataModel.getAllCards()
        result = json.dumps(cards,indent=4)
        resp.status = falcon.HTTP_200  # This is the default status        
        resp.text = (result)
        resp.content_type = falcon.MEDIA_JSON
    
class BookmarkHandler():
    def __init__(self,tappy):
        self.tappy = tappy

    def on_post(self,req,resp):
        eventBody = req.media
        log.info(f'received event: {eventBody}')
        cardDetails = {}
        actionType = eventBody.get("type")
        content = eventBody.get("content")
        id = eventBody.get("id")

        self.tappy.dataModel.setBookmark(id,content)

        resp.status = falcon.HTTP_200  # This is the default status        
        resp.text = ("{}")
        resp.content_type = falcon.MEDIA_JSON

    def on_get(self,req,resp):
        bookmarks = self.tappy.dataModel.getAllBookmarks()
        result = json.dumps(bookmarks,indent=4)
        resp.status = falcon.HTTP_200  # This is the default status        
        resp.text = (result)
        resp.content_type = falcon.MEDIA_JSON

    def on_delete(self,req,resp):
        self.tappy.dataModel.deleteAllBookmarks()
        resp.status = falcon.HTTP_200  # This is the default status        
        resp.text = ("{}")
        resp.content_type = falcon.MEDIA_JSON

class CardActionHandler():
    def __init__(self,tappy):
        self.tappy = tappy

    def on_post(self,req,resp):
        eventBody = req.media
        log.info(f'received event: {eventBody}')
        cardDetails = {}
        actionType = eventBody.get("type")

        if actionType == "cancel":
            self.tappy.reader.cancelReadConfig()
            self.tappy.beep(count=3,delay=.2)

        elif actionType == "linkToContent":
            cardDetails = eventBody.get("content")
            timeout = eventBody.get("timeout") or 30
            self.tappy.reader.pushReadConfig(
                config=ReadConfig(
                    readComplete=lambda uid,tapCount : self.tappy.dataModel.updateCardData(uid,cardDetails),
                    read=None,
                    timeout=timeout,
                    maxReads=1,
                    beep=True,
                    autoRemove=True
                )
            )
            self.tappy.beep(count=2,delay=.2)

        elif actionType == "identifyCardContent":
            timeout = eventBody.get("timeout") or 30
            self.tappy.reader.pushReadConfig(
                config=ReadConfig(
                    readComplete=None,
                    read=None,
                    timeout=timeout,
                    maxReads=1,
                    beep=True,
                    autoRemove=True
                )
            )
            self.tappy.beep(count=2,delay=.2)

        result = buildLastReadData(self.tappy.dataModel)
        resultJson = json.dumps(result,indent=4)
        resp.status = falcon.HTTP_200  # This is the default status        
        resp.text = (resultJson)
        resp.content_type = falcon.MEDIA_JSON

class CardUpdateHandler():
    def __init__(self,tappy):
        self.tappy = tappy

    def on_post(self,req,resp,id):
        resp.status = falcon.HTTP_200  # This is the default status        
        resp.text = ('{}')
        eventBody = req.media
        log.debug(f'received event: {eventBody}')
        cardDetails = {}
        cardDetails["url"] = eventBody.get("url")
        cardDetails["cover"] = eventBody.get("cover")
        cardDetails["title"] = eventBody.get("title")
        cardDetails["details"] = eventBody.get("details")
        self.tappy.dataModel.updateCardData(id,cardDetails)

    def on_get(self,req,resp,id):
        card = self.tappy.dataModel.getCard(id) or {}
        resultJson = json.dumps(card,indent=4)
        resp.status = falcon.HTTP_200  # This is the default status        
        resp.text = (resultJson)
        resp.content_type = falcon.MEDIA_JSON

    def on_delete(self,req,resp,id):
        self.tappy.dataModel.deleteCardData(id)

class RestService:
    def __init__(self,tappy):
        self.app = falcon.App()
        self.tappy = tappy
        self.app.add_route("/api/card/link",CardActionHandler(tappy))
        self.app.add_route("/api/card/last",LastCardHandler(tappy))
        self.app.add_route("/api/card/{id}",CardUpdateHandler(tappy))
        self.app.add_route("/api/card",CardHandler(tappy))
        self.app.add_route("/api/bookmarks",BookmarkHandler(tappy))
        self.app.add_route("/api/speakers",DeviceHandler(tappy))
        self.app.add_route("/api/speakers/active",DeviceHandler(tappy),suffix="active")
    def stop(self):
        self.server.shutdown()
        self.thread.join()

    def start(self):
        self.server = make_server('', 8000, self.app, threaded=True)
        self.thread = Thread(target=lambda : self.server.serve_forever())
        self.thread.start()
