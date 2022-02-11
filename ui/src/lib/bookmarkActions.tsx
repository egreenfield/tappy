import { message } from "antd";
import { refreshBookmarks } from "./loaders";
import { CardData, Content } from "./tappyDataTypes";
import { fetchJ, headers } from "./common";

export const BOOKMARK_ENDPOINT=`http://${process.env.REACT_APP_APPSERVER_DOMAIN}/api/bookmarks`

export async function bookmarkContent(id:string,content:Content) {

  message.loading({content: "Bookmarking...",key:"bookmarking"});
    let response = await fetchJ(BOOKMARK_ENDPOINT,{
      method: 'POST',
      body: JSON.stringify({
        id,
        content,
      }),
      headers,      
  })
  refreshBookmarks();
  message.success({content: "Bookmarked", duration: 3,key:"bookmarking"});
  return response;
}

export async function deleteBookmark(bookmark:CardData) {
    let response = await fetchJ(`${BOOKMARK_ENDPOINT}/${bookmark.id}`,{
        method: 'DELETE',
        headers,      
    })
  refreshBookmarks();
  return response;
}

export async function deleteBookmarks() {
  let response = await fetchJ(BOOKMARK_ENDPOINT,{
    method: 'DELETE',
    body: "",
    headers,      
  })
  refreshBookmarks();
  return response;
}
