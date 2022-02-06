
//----------------------------------------------------------------
// Server Side

import { CardData } from "../client/cardActions";

export async function getCurrentCards():Promise<CardData[]> {
    let response = await fetch('http://10.0.0.99:8000/api/card',{
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "GET"
        });
    let cardMap = await response.json();
    return Object.keys(cardMap).map<CardData>(id => ({id, content:cardMap[id]}))
}