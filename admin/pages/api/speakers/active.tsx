import type { NextApiRequest, NextApiResponse } from 'next'



type Data = {
    name: string
  }
  
export default async function handler(req:NextApiRequest, res:NextApiResponse<Data>) {
    if (req.method != "POST") {
        res.status(500)
    }

    let deviceResponse = await fetch("http://10.0.0.99:8000/api/speakers/active",{
        method: 'POST',
        body: JSON.stringify(req.body),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },      
    })
    res.status(200).json(await deviceResponse.json())
}