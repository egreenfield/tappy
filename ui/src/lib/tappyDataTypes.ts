

export interface Content {
    url:string;
    cover:string;
    title:string;
    details: {
        printed:boolean;
        type:string;
        artist:string;
    }
}

export interface CardDataMap { [key: string]: CardData; }

export interface CardData {
    id:string;
    content:Content;
}
