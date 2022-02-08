
//----------------------------------------------------------------
// Server Side

import { CardData } from "../client/cardActions";

export async function getBookmarks():Promise<CardData[]> {
    let response = await fetch('http://10.0.0.99:8000/api/bookmarks',{
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "GET"
        });
    let bookmarkMap = await response.json();
    return Object.keys(bookmarkMap).map<CardData>(id => ({id, content:bookmarkMap[id]}))
}

