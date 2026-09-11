import soco
from soco.discovery import by_name, scan_network
from soco.plugins.sharelink import ShareLinkPlugin  # type: ignore
import logging
log = logging.getLogger(__name__)


class Stereo:
    """Finds Sonos speakers by name and plays share links on them.

    Speaker lookup never raises: it returns None when a speaker cannot be found, and every
    public method logs and swallows errors so a flaky network can't take down the card loop.
    """

    def __init__(self, tappy):
        self.tappy = tappy
        self._cache = {}  # speaker name -> SoCo, so a tap doesn't need a 5s discovery every time

    def findDevice(self, name):
        cached = self._cache.get(name)
        if cached is not None:
            try:
                if cached.player_name == name:
                    return cached
            except Exception as e:
                log.warning(f"cached speaker '{name}' at {cached.ip_address} stopped answering: {e}")
            self._cache.pop(name, None)

        device = None
        # 1. normal SSDP multicast discovery
        try:
            device = by_name(name)
        except Exception as e:
            log.warning(f"SSDP discovery for '{name}' failed: {e}")
        # 2. unicast scan of the local subnet; works when multicast is being dropped
        if device is None:
            log.info(f"'{name}' not found via SSDP, scanning the network")
            try:
                for candidate in scan_network() or []:
                    if candidate.player_name == name:
                        device = candidate
                        break
            except Exception as e:
                log.warning(f"network scan for '{name}' failed: {e}")

        if device is None:
            log.error(f"speaker '{name}' not found")
        else:
            log.info(f"found '{name}' at {device.ip_address}")
            self._cache[name] = device
        return device

    def playUrl(self, deviceNames, url, shuffle=True):
        log.info(f"playing {url} on {deviceNames} shuffle={shuffle}")
        try:
            device = self.makeGroup(deviceNames)
            if device is None:
                self._signalFailure()
                return False
            device.stop()
            device.clear_queue()
            share_link = ShareLinkPlugin(device)
            device.shuffle = shuffle
            device.repeat = True
            result = share_link.add_share_link_to_queue(url)
            log.info(result)
            device.play_from_queue(0)
            return True
        except Exception:
            log.exception(f"failed to play {url} on {deviceNames}")
            self._cache.clear()
            self._signalFailure()
            return False

    def stopPlaying(self, deviceNames):
        try:
            device = self.makeGroup(deviceNames)
            if device is not None:
                device.stop()
        except Exception:
            log.exception(f"failed to stop {deviceNames}")

    def getDeviceNames(self):
        devices = None
        try:
            devices = soco.discover()
        except Exception as e:
            log.warning(f"SSDP discovery failed: {e}")
        if not devices:
            try:
                devices = scan_network()
            except Exception as e:
                log.warning(f"network scan failed: {e}")
        return sorted(d.player_name for d in (devices or []))

    def makeGroup(self, deviceNames):
        devices = [self.findDevice(name) for name in deviceNames]
        if not devices or any(d is None for d in devices):
            return None
        if len(devices) == 1:
            if not devices[0].is_coordinator:
                devices[0].unjoin()
            return devices[0]
        currentGroup = devices[0].group
        if all(aDevice.group.uid == currentGroup.uid for aDevice in devices):
            return currentGroup.coordinator
        coordinator = devices[0]
        coordinator.unjoin()
        for aDevice in devices:
            if aDevice != coordinator:
                aDevice.join(coordinator)
        return coordinator

    def _signalFailure(self):
        # four quick beeps: "heard the card, couldn't reach the speaker"
        if self.tappy is not None:
            try:
                self.tappy.beep(count=4, length=0.05, delay=0.05)
            except Exception:
                pass
