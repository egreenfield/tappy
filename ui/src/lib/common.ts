
export const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }


  export async function fetchJ(url:string,options:RequestInit) {
      return (await fetch(url,options)).json()
  }