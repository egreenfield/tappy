import falcon
import logging
from werkzeug.serving import run_simple

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
    def start(self):
        run_simple('', 8000, self.app, use_reloader=False, threaded=True,static_files={
#                '/videos': videoPath
            })
