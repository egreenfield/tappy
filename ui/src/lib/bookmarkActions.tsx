import { message } from "antd";
import { refreshBookmarks } from "./loaders";
import { CardData, Content } from "./tappyDataTypes";

export const BOOKMARK_ENDPOINT=`http://${process.env.REACT_APP_APPSERVER_DOMAIN}/api/bookmarks`

export async function bookmarkContent(id:string,content:Content) {

  message.loading({content: "Bookmarking...",key:"bookmarking"});
  message.success({content: "Bookmarked", duration: 3,key:"bookmarking"});
  let body = JSON.stringify({
        id,
        content,
    });
    let deviceResponse = await fetch(BOOKMARK_ENDPOINT,{
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
    let response = await fetch(`${BOOKMARK_ENDPOINT}/${bookmark.id}`,{
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
  let response = await fetch(BOOKMARK_ENDPOINT,{
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
