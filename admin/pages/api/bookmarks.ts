import type { NextApiRequest, NextApiResponse } from 'next'
import {loadLocalLibrary} from "../../lib/server/library"
import { getBookmarks } from '../../lib/server/serverBookmarks';




export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    if (req.method == "GET") {
        let items = [];
        let bookmarks = await getBookmarks();
        res.status(200).json(bookmarks)
    } else if (req.method == "POST") {
        let deviceResponse = await fetch("http://10.0.0.99:8000/api/bookmarks",{
            method: 'POST',
            body: JSON.stringify(req.body),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },      
        })
        res.status(200).json(await deviceResponse.json())    
    } else if (req.method == "DELETE") {
        let deviceResponse = await fetch("http://10.0.0.99:8000/api/bookmarks",{
            method: 'DELETE',
            body: JSON.stringify(req.body),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },      
        })
        res.status(200).json(await deviceResponse.json())    
    } else {
        res.status(500).json({error:"unsupported method"})
    }
}