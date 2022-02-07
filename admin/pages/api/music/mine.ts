import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { RiChatCheckFill } from 'react-icons/ri'
import { markAlbumAsLoaded } from '../../../lib/server/library'
import { getUsersMusic, getUsersPlaylists, saveAlbum, saveArtist } from '../../../lib/server/spotify'



type Data = {
    error?:string;
    playlists?: any[];
    albums?: any[];
  }
  
export default async function handler(req:NextApiRequest, res:NextApiResponse<Data>) {
    console.log("REQUEST IS",req.method)
    if (req.method == "GET") {
        const session = await getSession({ req })
        if(session && session.token.accessToken) {
            let response = await getUsersMusic(session.token.accessToken);
            res.status(200).json(response)
        } else {
            res.status(500).json({error: "not signed in"})
        }
    }
    else if (req.method == "POST") {
        let content = req.body;
        try {
        const session = await getSession({ req })
            if(session && session.token.accessToken) {
                if (content.type == "album") {
                    try {
                        let result = await saveAlbum(session.token.accessToken,content.id);
                        await markAlbumAsLoaded(content.library,content.artist,content.albumName);
                        res.status(200).json({});
                    } catch (e) {
                        res.status(500).json({error: "unable to save album"})
                    }
                } else if (content.type == "artist") {
                    try {
                        let result = await saveArtist(session.token.accessToken,content.id);
                        res.status(result.status).json({});
                    } catch (e) {
                        res.status(500).json({error: "unable to save artist"})
                    }
                } else {
                    res.status(500).json({error:"unknown type to be saved"});
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