import type { NextApiRequest, NextApiResponse } from 'next'
import {loadLocalLibrary} from "../../lib/server/library"




export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    if (req.method != "POST") {
        res.status(500)
    } 
    let items = [];
    let path = req.query["q"];
    let folderContents = await loadLocalLibrary(path);
    res.status(200).json(folderContents)
}