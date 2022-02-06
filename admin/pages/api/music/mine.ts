import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getUsersMusic, getUsersPlaylists } from '../../../lib/server/spotify'



type Data = {
    error?:string;
    playlists?: any[];
    albums?: any[];
    artists?: any[];
  }
  
export default async function handler(req:NextApiRequest, res:NextApiResponse<Data>) {
    if (req.method != "GET") {
        res.status(500)
    }
    const session = await getSession({ req })
    if(session && session.token.accessToken) {
        let response = await getUsersMusic(session.token.accessToken);
        res.status(200).json(response)
    } else {
        res.status(500).json({error: "not signed in"})
    }
}