
export const getSpeakers = async () => {
    let deviceResponse = await fetch("http://10.0.0.99:8000/api/speakers",{
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },      
    })
    return await deviceResponse.json()
  }    