const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');


const TOKEN_ENDPOINT =            'https://accounts.spotify.com/api/token';
const PLAYLISTS_ENDPOINT =        'https://api.spotify.com/v1/me/playlists';
const PLAYLIST_CONTENT_ENDPOINT = 'https://api.spotify.com/v1/playlists/';
const SEARCH_ENDPOINT =           'https://api.spotify.com/v1/search';
const ARTIST_DETAIL_ENDPOINT = 'https://api.spotify.com/v1/artists/';
const ALBUM_DETAIL_ENDPOINT = 'https://api.spotify.com/v1/albums/';

const getAccessToken = async (refresh_token) => {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
      }),
    });
  
    return response.json();
  };

  export const getUsersPlaylists = async (refresh_token) => {
    const {access_token} = await getAccessToken(refresh_token);
    return fetch(PLAYLISTS_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  };

  export const getPlaylistContent = async(refresh_token:string,id:string) => {
    const {access_token} = await getAccessToken(refresh_token);
    return fetch(PLAYLIST_CONTENT_ENDPOINT+id, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

  }

  export async function searchForArtists(refresh_token:string,searchText:string) {
    
    const {access_token} = await getAccessToken(refresh_token);

    let url = new URL(SEARCH_ENDPOINT);
    let params = new URLSearchParams();
    params.set("q",searchText);
    params.set("type","artist");
    url.search = params.toString();
    let artists = []

    try {
      let results = await fetch( url.toString(), {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": 'application/json'
        },      
      });
      let json = await results.json();
      console.log("results:",json)
      artists = json.artists.items;    
      } catch(e) {
      console.log("got an error:",e);
    }
    return artists;
  }
  export interface TrackData {
    name:string;    
  }
  export interface AlbumData {
    id:string;
    name: string
    images: {url:string}[]
    tracks?:TrackData[];
    external_urls: {
      spotify:string;
    }
  }

  export interface ArtistDetail {
    id: string;  
    name: string;
    images: {url:string}[]
    albums: AlbumData[]
    external_urls: {
      spotify:string;
    }
  }

  export async function getArtistDetail(refresh_token:string,id:string):Promise<ArtistDetail> {
    const {access_token} = await getAccessToken(refresh_token);
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


  export async function getAlbumDetail(refresh_token:string,id:string):Promise<AlbumData> {
    const {access_token} = await getAccessToken(refresh_token);
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
      tracks:albumTracks.items,
      external_urls:albumDetail.external_urls         
    }
  }