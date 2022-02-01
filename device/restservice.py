import falcon

class CardLinkHander():
    def __init__(self):
        pass

    def on_post(self,req,resp):
        resp.status = falcon.HTTP_200  # This is the default status        
        resp.text = ('{}')
        eventBody = req.media
        log.debug(f'received event: {eventBody}')
        self.deviceMgr.raiseEvent(eventBody)

class RestService:
    def __init__(self):
        self.app = falcon.App()
        self.app.add_route("/api/card/link",CardLinkHandler())