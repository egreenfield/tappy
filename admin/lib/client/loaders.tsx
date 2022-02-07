//-----
// Client

import useSWR from "swr";
  
    const fetcher = (url) => fetch(url).then((res) => res.json())

  export function useLibrary() {
    const {data:music,error} = useSWR("/api/music/mine",fetcher,{revalidateOnMount:true});
    return {music,error}
  }
  

  export async function getAlbumDetail(id:string) {
      return await (await fetch("/api/music/album/"+id)).json()
  }