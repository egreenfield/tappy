import { fetchJ, headers } from "./common";

const SPEAKER_ENDPOINT=`${process.env.REACT_APP_APPSERVER_PREFIX}/api/speakers`

export async function setActiveSpeakers(speakers:string[]) {
  return await fetchJ(`${SPEAKER_ENDPOINT}/active`,{
      method: 'POST',
      body: JSON.stringify({names:speakers}),
      headers,      
  })
}
export async function getSpeakerData(_:String) {
  return await fetchJ(`${SPEAKER_ENDPOINT}`,{
      method: 'GET',
      headers,      
  })
}

