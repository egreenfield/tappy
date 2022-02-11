import { fetchJ, headers } from "./common";
import { BOOKMARK_ENDPOINT } from "./bookmarkActions";
import { CARD_ENDPOINT } from "./cardActions";
import { CardData } from "./tappyDataTypes";


export async function getCards(_:String) {
    let cardMap = await fetchJ(CARD_ENDPOINT,{
        method: "GET",
        headers,
    });
    return Object.keys(cardMap).map<CardData>(id => ({id, content:cardMap[id]}))
}


export async function getBookmarks(_:String) {
    let bookmarkMap = await fetchJ(BOOKMARK_ENDPOINT,{
        method: "GET",
        headers,
    });
    return Object.keys(bookmarkMap).map<CardData>(id => ({id, content:bookmarkMap[id]}))
}
