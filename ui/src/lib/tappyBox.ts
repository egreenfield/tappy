import { CardData } from "./tappyDataTypes";

export async function getCards(abc:String) {
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
