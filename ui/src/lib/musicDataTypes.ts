
export interface Entity {
    name:string;
    id:string;
    images:Image[];
    external_urls:{
        spotify:string;
    }
}
export interface Image {
    url:string;
}

export interface Artist extends Entity {
}

export interface Album extends Entity {
}
export interface Track extends Entity {
    album:Album;
}

export interface Playlist extends Entity {
}