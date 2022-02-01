import falcon
import logging
import json
from threading import Thread
from werkzeug.serving import run_simple
from werkzeug.serving import make_server

log = logging.getLogger(__name__)

class CardHandler():
    def __init__(self,tappy):
        self.tappy = tappy

    def on_get(self,req,resp):
        cards = self.tappy.dataModel.getAllCards()
        result = json.dumps(cards,indent=4)
        resp.status = falcon.HTTP_200  # This is the default status        
        resp.text = (result)
        resp.content_type = falcon.MEDIA_JSON

class CardLinkHandler():
    def __init__(self,tappy):
        self.tappy = tappy

    def on_post(self,req,resp):
        resp.status = falcon.HTTP_200  # This is the default status        
        resp.text = ('{}')
        eventBody = req.media
        log.debug(f'received event: {eventBody}')
        cardDetails = {}
        cardDetails["url"] = eventBody["url"]
        cardDetails["cover"] = eventBody["cover"]
        cardDetails["title"] = eventBody["title"]
        cardDetails["details"] = eventBody["details"]
        timeout = eventBody.get("timeout") or 30
        self.tappy.reader.overrideReadCallback(callback=lambda uid : self.tappy.dataModel.updateCardData(uid,cardDetails),timeout=timeout)

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

class RestService:
    def __init__(self,tappy):
        self.app = falcon.App()
        self.tappy = tappy
        self.app.add_route("/api/card/link",CardLinkHandler(tappy))
        self.app.add_route("/api/card/{id}}",CardUpdateHandler(tappy))
        self.app.add_route("/api/card",CardHandler(tappy))
    def stop(self):
        self.server.shutdown()
        self.thread.join()

    def start(self):
        self.server = make_server('', 8000, self.app, threaded=True)
        self.thread = Thread(target=lambda : self.server.serve_forever())
        self.thread.start()
