
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

export function entityType(e:Entity) {
    if ("tracks" in e) {
        if("artists" in e) {
            return "album";
        } else {
            return "playlist";
        }
    } else if ("album" in e) {
        return "track";
    } else if ("albums" in e) {
        return "artist"
    } else {
        throw new Error("unknown Entity type");
    }   
}


export interface PagedList<ItemType> {
    total:number;
    get(start:number,count:number):Promise<ItemType[]>;
    init():Promise<void>
}



export interface PagedChunk<T> {
    href:string;
    limit:number;
    next:string|null;
    offset:BigInteger;
    previous:string|null;
    total:number;
    items:T[];
}