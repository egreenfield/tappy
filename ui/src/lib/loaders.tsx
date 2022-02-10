//-----
// Client

import useSWR from "swr";
import { getUsersMusic } from "./spotify";
import { getCards } from "./tappyBox";
  

  const fetcher = (url:string) => fetch(url).then((res) => res.json())

  export function useLibrary(accessToken:string|undefined) {
    const {data:music,error} = useSWR(accessToken,getUsersMusic,{revalidateOnMount:true});
    return {music,error}
  }
  

  export async function getAlbumDetail(id:string) {
      return await (await fetch("/api/music/album/"+id)).json()
  }




let uccCount = 0

export function useCurrentCards() {
  console.log("use current cards");
  const {data:cards,error} = useSWR([""],getCards,{revalidateOnMount:true});
  return {cards,error};
}