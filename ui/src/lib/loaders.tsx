//-----
// Client

import useSWR, { KeyedMutator } from "swr";
import { Album, Artist, Playlist } from "./musicDataTypes";
import { getAlbumDetails, getArtistDetails, getPlaylistContent, getUsersMusic } from "./musicService";
import { getSpeakerData } from "./speakers";
import { getBookmarks, getCards } from "./tappyBox";
import { CardData } from "./tappyDataTypes";
  

  const fetcher = (url:string) => fetch(url).then((res) => res.json())

  export function useLibrary(accessToken:string|undefined) {
    const {data:music,error} = useSWR(accessToken,getUsersMusic,{revalidateOnMount:true});
    return {music,error}
  }
  

let cardsMutator:KeyedMutator<CardData[]>;
  export function refreshCards() {cardsMutator && cardsMutator();}
  export function useCurrentCards() {
  const {data:cards,mutate,error} = useSWR(["cards"],getCards,{revalidateOnMount:true});
  cardsMutator = mutate;
  return {cards,error};
}

let bookmarkMutate:KeyedMutator<CardData[]>;
export function refreshBookmarks() {bookmarkMutate && bookmarkMutate();}
export function useBookmarks() {
  const {data:bookmarks,mutate,error} = useSWR(["bookmarks"],getBookmarks,{revalidateOnMount:true});
  bookmarkMutate = mutate;
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
  const {data:album,error} = useSWR<Album>([token,id],getAlbumDetails,{revalidateOnMount:true});
  return {album,error};
}