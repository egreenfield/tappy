import { message } from "antd";
import { CardData, Content } from "./tappyDataTypes";

export async function bookmarkContent(id:string,content:Content) {
  message.loading({content: "Bookmarking...",key:"bookmarking"});
  message.success({content: "Bookmarked", duration: 3,key:"bookmarking"});
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

export async function deleteBookmark(bookmark:CardData) {
  let response = await fetch(`/api/bookmarks/${bookmark.id}`,{
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: "DELETE"
  })  
  let responseData = await response.json()    
  return responseData;
}

export async function deleteBookmarks() {
  let response = await fetch('/api/bookmarks',{
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "DELETE"
    })  
  let responseData = await response.json()    
  return responseData;
}
