import { Content } from "./cardActions";

export async function bookmarkContent(id:string,content:Content) {
    let body = JSON.stringify({
        id,
        content,
    });
    let response = await fetch('/api/bookmarks',{
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body
      })  
    let responseData = await response.json()    
    return responseData;
}

export async function getBookmarks() {
    let response = await fetch('/api/bookmarks',{
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "GET"
      })  
    let responseData = await response.json()    
    return responseData;
}
