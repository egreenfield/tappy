import { BOOKMARK_ENDPOINT } from "./bookmarkActions";
import { CARD_ENDPOINT } from "./cardActions";
import { CardData } from "./tappyDataTypes";


export async function getCards(_:String) {
    console.log("get cards")
    let response = await fetch(CARD_ENDPOINT,{
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    method: "GET"
    });
    let cardMap = await response.json();
    return Object.keys(cardMap).map<CardData>(id => ({id, content:cardMap[id]}))
}


export async function getBookmarks(_:String) {
    let response = await fetch(BOOKMARK_ENDPOINT,{
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "GET"
        });
    let bookmarkMap = await response.json();
    return Object.keys(bookmarkMap).map<CardData>(id => ({id, content:bookmarkMap[id]}))
}
