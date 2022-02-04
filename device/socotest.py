import soco
from soco.plugins.sharelink import ShareLinkPlugin  # type: ignore

devices=  soco.discover()
#d = devices.pop()
#print(f"first device is {d.player_name}")

def pn(d):
    return d.player_name
ds = list(map(lambda d: d.player_name,devices))
print(f"devices are {ds}")
