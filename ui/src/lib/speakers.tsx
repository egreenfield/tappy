
export async function setActiveSpeakers(speakers:string[]) {

  let deviceResponse = await fetch("http://10.0.0.99:8000/api/speakers/active",{
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
  let deviceResponse = await fetch("http://10.0.0.99:8000/api/speakers",{
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },      
  })
  return await deviceResponse.json()
}

