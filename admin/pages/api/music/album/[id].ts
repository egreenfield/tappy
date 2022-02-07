import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { AlbumData, getAlbumDetail, getUsersMusic, getUsersPlaylists } from '../../../../lib/server/spotify'



  
export default async function handler(req:NextApiRequest, res:NextApiResponse<AlbumData>) {
    if (req.method != "GET") {
        res.status(500)
    }
    const session = await getSession({ req })
    if(session && session.token.accessToken) {
        let response = await await getAlbumDetail(session.token.accessToken,req.query.id as string);
        res.status(200).json(response)
    } else {
        res.status(500).json({error: "not signed in"} as any)
    }
}