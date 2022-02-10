//-----
// Client

import useSWR from "swr";
import { Album, Artist, Playlist } from "./musicDataTypes";
import { getArtistDetails, getPlaylistContent, getUsersMusic } from "./musicService";
import { getSpeakerData } from "./speakers";
import { getBookmarks, getCards } from "./tappyBox";
  

  const fetcher = (url:string) => fetch(url).then((res) => res.json())

  export function useLibrary(accessToken:string|undefined) {
    const {data:music,error} = useSWR(accessToken,getUsersMusic,{revalidateOnMount:true});
    return {music,error}
  }
  

  export async function getAlbumDetail(id:string) {
      return await (await fetch("/api/music/album/"+id)).json()
  }




export function useCurrentCards() {
  console.log("use current cards");
  const {data:cards,error} = useSWR(["cards"],getCards,{revalidateOnMount:true});
  return {cards,error};
}

export function useBookmarks() {
  const {data:bookmarks,error} = useSWR(["bookmarks"],getBookmarks,{revalidateOnMount:true});
  return {bookmarks,error};
}

export function useSpeakers():{speakerData:{speakers:string[],active:string[]}|undefined,error:string} {
  const {data:speakerData,error} = useSWR<{speakers:string[],active:string[]}>(["speakers"],getSpeakerData,{revalidateOnMount:true});
  return {speakerData,error};
}

export function usePlaylist(token:string|undefined,id:string|undefined) {
  const {data:playlist,error} = useSWR<Playlist>([token,id],getPlaylistContent,{revalidateOnMount:true});
  return {playlist,error};
}

export function useArtist(token:string|undefined,id:string|undefined) {
  const {data:artist,error} = useSWR<Artist>([token,id],getArtistDetails,{revalidateOnMount:true});
  return {artist,error};
}

export function useAlbum(token:string|undefined,id:string|undefined) {
  const {data:album,error} = useSWR<Album>([token,id],getAlbumDetail,{revalidateOnMount:true});
  return {album,error};
}