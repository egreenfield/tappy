from os import path
import json
import logging
log = logging.getLogger(__name__)

class DataModel:
    def __init__(self):
        albumPath = path.join(path.dirname(path.abspath(__file__)),"../config.json")
        file = open(albumPath)
        self.config = json.load(file)
        log.info(f"loaded cardmap as {self.cardMap}")

    @property
    def cardMap(self):
        return self.config["cards"]
    
    @property
    def speaker(self):
        return self.config["speaker"]
    @speaker.setter
    def speaker(self,value):
        self.config["speaker"] = value
