import soco
from soco.plugins.sharelink import ShareLinkPlugin  # type: ignore
import logging
log = logging.getLogger(__name__)

class Stereo:
    def __init__(self,tappy):
        self.tappy = tappy

    def playUrl(self,deviceName,url):
        log.info(f"playing {url}")
        device = soco.discovery.by_name(deviceName)
        device.stop()
        device.clear_queue()
        share_link = ShareLinkPlugin(device)
        device.shuffle = True
        device.repeat = True
        result = share_link.add_share_link_to_queue(url)
        log.info(result)
        device.play_from_queue(0)

    def stopPlaying(self,deviceName):
        device = soco.discovery.by_name(deviceName)
        device.stop()

    def getDeviceNames(self):
        devices=  soco.discover()
        ds = list(map(lambda d: d.player_name,devices))
        return ds
