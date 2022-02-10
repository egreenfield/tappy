
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


export interface Album extends Entity {
    artists?:Artist[];
    tracks?:Track[];
}

export interface Artist extends Entity {
    albums?:Album[];
}

export interface Track extends Entity {
    album:Album;
}

export interface PlaylistEntry {
    track: Track;
}
  
export interface Playlist extends Entity {
    description:string;
    tracks: {items:PlaylistEntry[]}
}