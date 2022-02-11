
const SPEAKER_ENDPOINT=`http://${process.env.REACT_APP_APPSERVER_DOMAIN}/api/speakers`

export async function setActiveSpeakers(speakers:string[]) {

  let deviceResponse = await fetch(`${SPEAKER_ENDPOINT}/active`,{
      method: 'POST',
      body: JSON.stringify({names:speakers}),
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },      
  })
  return await deviceResponse.json();
}

export async function getSpeakerData(_:String) {
  let deviceResponse = await fetch(`${SPEAKER_ENDPOINT}/speakers`,{
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },      
  })
  return await deviceResponse.json()
}

