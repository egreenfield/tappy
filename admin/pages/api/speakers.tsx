import type { NextApiRequest, NextApiResponse } from 'next'



type Data = {
    name: string
  }
  
export default async function handler(req:NextApiRequest, res:NextApiResponse<Data>) {
    let deviceResponse = await fetch("http://10.0.0.99:8000/api/speakers",{
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },      
    })
    res.status(200).json(await deviceResponse.json())
}