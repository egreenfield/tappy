import { CardData } from "./tappyDataTypes";

export async function getCards(_:String) {
    console.log("get cards")
    let response = await fetch('http://10.0.0.99:8000/api/card',{
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    method: "GET"
    });
    let cardMap = await response.json();
    console.log("GC: got ",cardMap);
    return Object.keys(cardMap).map<CardData>(id => ({id, content:cardMap[id]}))
}


export async function getBookmarks(_:String) {
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
