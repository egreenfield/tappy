import { Album, Artist, Playlist, Track } from "./musicDataTypes";
const SEARCH_ENDPOINT = "";

export interface SearchResults {
    albums?:Album[];
    artists?:Artist[];
    playlists?:Playlist[];
    tracks?:Track[];
}
export async function searchContent(
    searchText:string,
    type="artist,album,track,playlist") :Promise<SearchResults> {
        const access_token = "";

    let url = new URL(SEARCH_ENDPOINT);
    let params = new URLSearchParams();
    params.set("q",searchText);
    params.set("type",type);
    url.search = params.toString();
    console.log("searching",url.toString());
    
    let result = { artists:[], albums: [], tracks:[],playlists:[]}
    
    try {
        let results = await fetch( url.toString(), {
        headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": 'application/json'
        },      
        });
        let json = await results.json();
        console.log("searchTerm: '" + searchText+"', results:",json)
        result.artists = json.artists?.items;    
        result.albums = json.albums?.items;
        result.tracks = json.tracks?.items;
        result.playlists = json.playlists?.items;
        } catch(e) {
        console.log("got an error:",e);
    }
    return result;
}
