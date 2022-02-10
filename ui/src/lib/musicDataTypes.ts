
export interface Entity {
    name:string;
    id:string;
    images:Image[];
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