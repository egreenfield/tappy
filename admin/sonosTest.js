const { AsyncDeviceDiscovery, DeviceDiscovery, Sonos } = require('sonos')

let groups = {}
let devices = {}

async function inspect(device) {
//    console.log('found device at ' + device)

    let zi = await device.getZoneInfo();
    let za = await device.getZoneAttrs();
//    console.log(`zone info: ${za.CurrentZoneName}`)
    //device.queue("https://open.spotify.com/playlist/1BcqUS1Ivi3HHFupnvsAVk?si=f687707dd8154481")
    //device.setMuted(true);
    devices[za.CurrentZoneName] = device;
  // get all groups
  let groupList = await device.getAllGroups();
  groupList.forEach(group => {
      groups[group.Name] = group;
      //console.log('found group:' + group.Name);
    })
}
//find one device
// DeviceDiscovery((device) => {
//     inspect(device);
// })

(async () => {
    let discovery = new AsyncDeviceDiscovery()
    let deviceList = await discovery.discoverMultiple({timeout:1000});
    for (let aDevice of deviceList)
        await inspect(aDevice);
    for (let deviceName of Object.keys(devices)) {
        console.log("found Device " + deviceName)
    }
    for (let groupName of Object.keys(groups)) {
        console.log("found Group " + groupName)
    }

    try {
        //await devices["Study"].queue("https://open.spotify.com/playlist/1BcqUS1Ivi3HHFupnvsAVk?si=f687707dd8154481");
        await devices["Study"].play();
    } catch(e) {
        console.log("WHOAH" + e);
    }
})()

// const device = new Sonos('Study');

// device.play()
//   .then(() => console.log('now playing'))

// device.getVolume()
//   .then((volume) => console.log(`current volume = ${volume}`))
