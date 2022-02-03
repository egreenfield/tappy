import falcon
import logging
import json
from threading import Thread
from werkzeug.serving import run_simple
from werkzeug.serving import make_server

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

class CardHandler():
    def __init__(self,tappy):
        self.tappy = tappy

    def on_get(self,req,resp):
        cards = self.tappy.dataModel.getAllCards()
        result = json.dumps(cards,indent=4)
        resp.status = falcon.HTTP_200  # This is the default status        
        resp.text = (result)
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
            self.tappy.reader.overrideReadCallback(callback=None,timeout=0)
            self.tappy.beep(count=3,delay=.2)

        elif actionType == "linkToContent":
            cardDetails = eventBody.get("content")
            timeout = eventBody.get("timeout") or 30
            self.tappy.reader.overrideReadCallback(callback=lambda uid : self.tappy.dataModel.updateCardData(uid,cardDetails),timeout=timeout,beep=True)
            self.tappy.beep(count=2,delay=.2)

        elif actionType == "identifyCardContent":
            timeout = eventBody.get("timeout") or 30
            self.tappy.reader.overrideReadCallback(callback=lambda uid : None,timeout=timeout,beep=True)
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
    def stop(self):
        self.server.shutdown()
        self.thread.join()

    def start(self):
        self.server = make_server('', 8000, self.app, threaded=True)
        self.thread = Thread(target=lambda : self.server.serve_forever())
        self.thread.start()
