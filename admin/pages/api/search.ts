import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { searchForArtists } from '../../lib/spotify'



type Data = {
    error?:string;
    artists?:any[];
}
  
export default async function handler(req:NextApiRequest, res:NextApiResponse<Data>) {
    if (req.method != "POST") {
        res.status(500)
    }
 
    const session = await getSession({ req })
    let items = []
    if(session && session.token.accessToken) {
        let result = await searchForArtists(session.token.accessToken,req.query["q"] as string);
        res.status(200).json(result)
    } else {
        res.status(401).json({error: "not authorized"})
    }
}