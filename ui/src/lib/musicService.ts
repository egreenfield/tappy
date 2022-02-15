import { Album, Artist, PagedList, Playlist, Track } from "./musicDataTypes";

const SEARCH_ENDPOINT =           'https://api.spotify.com/v1/search';
const ALBUM_DETAIL_ENDPOINT = 'https://api.spotify.com/v1/albums/';
const ARTIST_DETAIL_ENDPOINT = 'https://api.spotify.com/v1/artists/';
const PLAYLIST_CONTENT_ENDPOINT = 'https://api.spotify.com/v1/playlists/';


class CursorSpotifyList<ItemType> implements PagedList<ItemType> {
  private cached:ItemType[];
  public total:number = -1;  
  private next:string;

  constructor(private access_token:string,private rootUrl:string,private transformer:((rawResopnse:any)=>any)| undefined=undefined) {    
    this.cached = [];    
    let next = new URL(rootUrl);
    let searchParams = next.searchParams;
    searchParams.set('limit','50');
    searchParams.set('type','artist');
    next.search = searchParams.toString();
    this.next = next.toString();
  }
  async init():Promise<void> {
    return this.get(0,1).then(()=>{});
  }
  public async get(start:number,count:number):Promise<ItemType[]> {

    let end = start+count;
    if(this.total > 0) {
      end = Math.min(end,this.total);
    }

    let toLoad = end - this.cached.length;    
    
    while(toLoad > 0) {
      let rawResponse = (await (await fetch(this.next,{
        headers: {
          Authorization: `Bearer ${this.access_token}`,
        },
      })).json());

      let response = this.transformer?this.transformer(rawResponse):rawResponse;

      this.total = response.total;
      this.next = response.next;
      
      let items = response.items;
      toLoad -= items.length;

      this.cached = this.cached.concat(items);
    }
    return this.cached.slice(start,start+count);
  }
}



class RandomAccessSpotifyList<ItemType,LoadedType=ItemType> implements PagedList<ItemType>{
  
  constructor(private access_token:string,private rootUrl:string,private transformer:((loaded:LoadedType[])=>ItemType[])| undefined=undefined) {    
  }

  async init():Promise<void> {
    return this.get(0,1).then(()=>{});
  }

  public total:number = -1;  
  public async get(start:number,count:number):Promise<ItemType[]> {
    let results:ItemType[] = [];

    let toLoad = this.total >= 0? Math.min(count,this.total):count;    
    let loader = new URL(this.rootUrl);
    let params = loader.searchParams;
    
    while(toLoad) {
      params.set("offset",start.toString())
      params.set("limit",Math.min(50,toLoad).toString());
      loader.search = params.toString();
      let response = (await (await fetch(loader.toString(),{
        headers: {
          Authorization: `Bearer ${this.access_token}`,
        },
      })).json());

      this.total = response.total;
      
      let loadedResults = this.transformer?this.transformer(response.items):response.items;
      toLoad -= loadedResults.length;
      results = results.concat(loadedResults);
    }

    return results;
  }
}


export async function getAlbumDetails(access_token:string,id:string):Promise<Album> {
    if(!access_token || !id)
        throw new Error("invalid parameters passed to getPlaylistContent");
    let albumDetailP = fetch(ALBUM_DETAIL_ENDPOINT+id, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    let albumTracksP = fetch(ALBUM_DETAIL_ENDPOINT+id+"/tracks?limit=50", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    let responses = await Promise.all([albumDetailP,albumTracksP]);
    let [albumDetail,albumTracks] = await Promise.all(responses.map(r => r.json()))
    return {
      id,
      name:albumDetail.name,
      images:albumDetail.images,
      artists:albumDetail.artists,
      tracks:albumTracks.items,
      external_urls:albumDetail.external_urls         
    }
  }
  

  
  
  export async function getArtistDetails(access_token:string|undefined,id:string|undefined):Promise<Artist> {
      if(!access_token || !id)
          throw new Error("invalid parameters passed to getPlaylistContent");
  
      let artistDetailP = fetch(ARTIST_DETAIL_ENDPOINT+id, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      let artistAlbumsP = fetch(ARTIST_DETAIL_ENDPOINT+id+"/albums?include_groups=album&limit=50", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      let responses = await Promise.all([artistDetailP,artistAlbumsP]);
      let [artistDetail,artistAlbums] = await Promise.all(responses.map(r => r.json()))
      return {
        id,
        name:artistDetail.name,
        images:artistDetail.images,
        external_urls:artistDetail.external_urls,
        albums:artistAlbums.items,
      }
    }
  
    

export const getPlaylistContent = async(access_token:string|undefined,id:string|undefined) => {
    if(!access_token || !id)
        throw new Error("invalid parameters passed to getPlaylistContent");

    let response = await fetch(PLAYLIST_CONTENT_ENDPOINT+id, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return response.json()
  }
  
  export async function getPage<T>(list:PagedList<T>|undefined,pageIndex:number,pageSize:number) {
    if (!list)
      throw new Error("no list provided");
    return list.get(pageIndex*pageSize,pageSize)
  }
  


export interface SearchResults {
    albums?:Album[];
    artists?:Artist[];
    playlists?:Playlist[];
    tracks?:Track[];
}

export interface Library {
  albums?:PagedList<Album>;
  artists?:PagedList<Artist>;
  playlists?:PagedList<Playlist>;
}

export async function searchContent(
    token:string,
    searchText:string,
    type="artist,album,track,playlist",
    ) :Promise<SearchResults> {

    let url = new URL(SEARCH_ENDPOINT);
    let params = new URLSearchParams();
    params.set("q",searchText);
    params.set("type",type);
    url.search = params.toString();
    console.log("searching",url.toString());
    
//    let api = new SpotifyApi();
    
    let result = { artists:[], albums: [], tracks:[],playlists:[]}
    
    try {
        let results = await fetch( url.toString(), {
        headers: {
            Authorization: `Bearer ${token}`,
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


export type AlbumSave = {
    album:Album;
}



export const getUsersMusic = async(accessToken:string):Promise<Library> => {
    const PLAYLISTS_ENDPOINT =        'https://api.spotify.com/v1/me/playlists?limit=50';
    const ALBUMS_ENDPOINT =        'https://api.spotify.com/v1/me/albums?limit=50';
    const ARTISTS_ENDPOINT =        'https://api.spotify.com/v1/me/following?type=artist&limit=50';

    if (accessToken === undefined) {
        return {artists:undefined,playlists:undefined,albums:undefined}
    }
    
  
    let pagedAlbumList = new RandomAccessSpotifyList<Album,AlbumSave>(accessToken,ALBUMS_ENDPOINT,(saves)=>saves.map(a => a.album));
    let pagedPlaylistList = new RandomAccessSpotifyList<Playlist>(accessToken,PLAYLISTS_ENDPOINT);
    let pagedArtistList = new CursorSpotifyList<Artist>(accessToken,ARTISTS_ENDPOINT,(r)=> r.artists)

    await Promise.all([pagedAlbumList.init(),pagedPlaylistList.init(),pagedArtistList.init()])

    let result = {
      artists: pagedArtistList,
      playlists: pagedPlaylistList,
      albums: pagedAlbumList
    }
    return result;
}
  