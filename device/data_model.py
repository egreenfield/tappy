from os import path
import json

class DataModel:
    def __init__(self):
        albumPath = path.join(path.dirname(path.abspath(__file__)),"../config.json")
        file = open(albumPath)
        self.config = json.load(file)
        print(f"cardmap is {self.cardMap}")

    @property
    def cardMap(self):
        return self.config["cards"]
    
    @property
    def speaker(self):
        return self.config["speaker"]
    @speaker.setter
    def speaker(self,value):
        self.config["speaker"] = value
