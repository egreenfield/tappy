import { message } from "antd";
import { refreshBookmarks } from "./loaders";
import { CardData, Content } from "./tappyDataTypes";

export async function bookmarkContent(id:string,content:Content) {

  message.loading({content: "Bookmarking...",key:"bookmarking"});
  message.success({content: "Bookmarked", duration: 3,key:"bookmarking"});
  let body = JSON.stringify({
        id,
        content,
    });
    let deviceResponse = await fetch("http://10.0.0.99:8000/api/bookmarks",{
      method: 'POST',
      body,
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },      
  })
  let responseData = await deviceResponse.json()    

  refreshBookmarks();

  return responseData;
}

export async function deleteBookmark(bookmark:CardData) {
    let response = await fetch(`http://10.0.0.99:8000/api/bookmarks/${bookmark.id}`,{
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },      
    })
  let responseData = await response.json()    

  refreshBookmarks();
  return responseData;
}

export async function deleteBookmarks() {
  let response = await fetch("http://10.0.0.99:8000/api/bookmarks",{
    method: 'DELETE',
    body: "",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },      
  })
  let responseData = await response.json()    

  refreshBookmarks();
  return responseData;
}
