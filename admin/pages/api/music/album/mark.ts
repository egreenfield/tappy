import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { RiChatCheckFill } from 'react-icons/ri'
import { markAlbumAsLoaded } from '../../../../lib/server/library'



type Data = {
    error?:string;
    playlists?: any[];
    albums?: any[];
  }
  
export default async function handler(req:NextApiRequest, res:NextApiResponse<Data>) {
    if (req.method == "POST") {
        let content = req.body;
        try {
            if (content.type == "album") {
                try {
                    await markAlbumAsLoaded(content.library,content.artist,content.albumName);
                    res.status(200).json({});
                } catch (e) {
                    res.status(500).json({error: "unable to save album"})
                }
            } else {
                res.status(500).json({error: "not signed in"})               
            }
        } catch(e) {
            res.status(500).json({error: "unable to save album"})
        }
    } else {
        res.status(500).json({error: "method " + req.method + " not allowed" })
    }
}