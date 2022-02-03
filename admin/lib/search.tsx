
export const search = async (artist:string) => {
    let url = '/api/search?' + 
    new URLSearchParams({
        "q":artist
    }).toString();

    let response = await (await fetch(url)).json();
    console.log("response is",response);
    return response.artists;
  }    