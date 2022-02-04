
export async function setActiveSpeaker(name:string) {
    let url = '/api/speakers/active';

    let body = JSON.stringify({
        name
    });

    let response = await (await fetch(url,{
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: "POST",
          body
    })).json();
    return response;
  }    