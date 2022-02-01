import falcon
import logging
from threading import Thread
from werkzeug.serving import run_simple
from werkzeug.serving import make_server

log = logging.getLogger(__name__)

class CardLinkHandler():
    def __init__(self,tappy):
        self.tappy = tappy

    def on_post(self,req,resp):
        resp.status = falcon.HTTP_200  # This is the default status        
        resp.text = ('{}')
        eventBody = req.media
        log.debug(f'received event: {eventBody}')

class RestService:
    def __init__(self,tappy):
        self.app = falcon.App()
        self.tappy = tappy
        self.app.add_route("/api/card/link",CardLinkHandler(tappy))
    def stop(self):
        self.server.shutdown()
        self.thread.join()

    def start(self):
        self.server = make_server('', 8000, self.app, threaded=True)
        self.thread = Thread(target=lambda : self.server.serve_forever())
        self.thread.start()
