import { Album, Artist, Playlist, Track } from "./musicDataTypes";

const SEARCH_ENDPOINT =           'https://api.spotify.com/v1/search';
const ALBUM_DETAIL_ENDPOINT = 'https://api.spotify.com/v1/albums/';
const ARTIST_DETAIL_ENDPOINT = 'https://api.spotify.com/v1/artists/';
const PLAYLIST_CONTENT_ENDPOINT = 'https://api.spotify.com/v1/playlists/';


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
  
  


export interface SearchResults {
    albums?:Album[];
    artists?:Artist[];
    playlists?:Playlist[];
    tracks?:Track[];
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


type AlbumReturnData = {
    album:Album;
}

export const getUsersMusic = async(accessToken:string) => {
    const PLAYLISTS_ENDPOINT =        'https://api.spotify.com/v1/me/playlists?limit=50';
    const ALBUMS_ENDPOINT =        'https://api.spotify.com/v1/me/albums?limit=50';
    const ARTISTS_ENDPOINT =        'https://api.spotify.com/v1/me/following?type=artist&limit=50';

    if (accessToken == undefined) {
        return {artists:[],playlists:[],albums:[]}
    }
    
    let playlistP = fetch(PLAYLISTS_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    let albumsP = fetch(ALBUMS_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    let artistsP = fetch(ARTISTS_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    let responses = await Promise.all([playlistP,albumsP,artistsP]);
    let [playlists,albums,artists] = await Promise.all(responses.map(r=>r.json()));
  
  
    let result = {
      artists: artists.artists.items,
      playlists: playlists.items,
      albums: albums.items.map((i:AlbumReturnData) => i.album)
    }
    return result;
}
  