//-----
// Client

import useSWR from "swr";
  
    const fetcher = (url) => fetch(url).then((res) => res.json())

  export function useLibrary() {
    const {data:music,error} = useSWR("/api/music/mine",fetcher);
    return {music,error}
  }
  