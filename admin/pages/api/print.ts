import type { NextApiRequest, NextApiResponse } from 'next'
import { getCurrentCards } from '../../lib/serverCardActions'



  
export default async function handler(req:NextApiRequest, res:NextApiResponse) {

    if (req.method != "GET") {
        res.status(500)
        return;
    }

    let currentCards = await getCurrentCards();
    let idsToPrint = (req.query["ids"] as string).split(",") 
    let idsToPrintMap = {}
    for (let anID of idsToPrint) {
        idsToPrintMap[anID] = true;
    }
    let cardsToPrint = currentCards.filter(card => card.id in idsToPrintMap)

    res.status(200).json(cardsToPrint)
}