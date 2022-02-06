
export async function setActiveSpeakers(names:string[]) {
    let url = '/api/speakers/active';

    let body = JSON.stringify({
        names
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