import { Entity } from "./musicDataTypes";

type AlbumReturnData = {
    album:Entity;
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
  