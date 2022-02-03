import type { NextApiRequest, NextApiResponse } from 'next'



type ResponseData = {
    result:number
  }
  
export default async function handler(req:NextApiRequest, res:NextApiResponse<ResponseData>) {
    if (req.method != "DELETE") {
        res.status(500)
    }
    let x:RequestInfo
    await fetch("http://10.0.0.99:8000/api/card/"+req.query.id,{
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },      
    })
    res.status(200).json({result:0})
}