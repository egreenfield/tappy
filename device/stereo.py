import soco
from soco.plugins.sharelink import ShareLinkPlugin  # type: ignore
import logging
log = logging.getLogger(__name__)

class Stereo:
    def __init__(self,tappy):
        self.tappy = tappy

    def playUrl(self,deviceNames,url,shuffle=True):
        log.info(f"playing {url}")
        device = self.makeGroup(deviceNames) #soco.discovery.by_name(deviceNames[0])
        device.stop()
        device.clear_queue()
        share_link = ShareLinkPlugin(device)
        device.shuffle = shuffle
        device.repeat = True
        result = share_link.add_share_link_to_queue(url)
        log.info(result)
        device.play_from_queue(0)

    def stopPlaying(self,deviceNames):
        device = self.makeGroup(deviceNames)#soco.discovery.by_name(deviceNames[0])
        device.stop()

    def getDeviceNames(self):
        devices=  soco.discover()
        ds = list(map(lambda d: d.player_name,devices))
        return ds

    def makeGroup(self,deviceNames):
        devices = list(map(lambda name: soco.discovery.by_name(name),deviceNames))
        if len(devices) == 1:
            if devices[0].is_coordinator == False:
                devices[0].unjoin()
            return devices[0]
        currentGroup = devices[0].group
        goodGroup = True
        for aDevice in devices:
            if aDevice.group.uid != currentGroup.uid:
                goodGroup = False
                break
        if (goodGroup):
            return currentGroup.coordinator
        coordinator = devices[0]
        coordinator.unjoin()
        for aDevice in devices:
            if aDevice != coordinator:
                aDevice.join(coordinator)
        return coordinator

