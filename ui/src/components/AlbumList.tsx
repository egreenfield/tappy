import { Space, Tooltip } from "antd";
import { ColumnsType } from "antd/lib/table";
import { IconContext } from "react-icons/lib";
import { Album, Entity  , PagedList } from "../lib/musicDataTypes";
import { FaLink as LinkIcon, FaExternalLinkAlt as Navigate } from 'react-icons/fa';
import {BsFillBookmarkFill as BookmarkIcon } from 'react-icons/bs';
import { Link } from "react-router-dom";
import { PagedTable } from "./PagedTable";


interface AlbumListProperties {
    pagedAlbumList:PagedList<Album>|undefined;
    linkCard:(content:Entity)=>void;
    startBookmark:(content:Entity)=>void;
}

export function AlbumList({pagedAlbumList,linkCard,startBookmark}:AlbumListProperties) {


    const makeColumns = (linkPrefix:string,linkable:boolean=true): ColumnsType<Album> => {
        return [
          {
            title: '',
            key: 'key',
            align: 'right',
            width: 60,
            render: (_,record) => <img alt="" src={record.images?.length? record.images[0].url:""} width="50" />
          },
          {
            title: '',
            width: 60,
            key: 'id',
            render: (_, record) => (
              <IconContext.Provider value={{ color: "#7777FF" }}>
                <Space size="middle">
                  <Tooltip title="Open in Spotify">
                  <a href={record.external_urls.spotify} target="_blank" rel="noreferrer">
                    <Navigate cursor="pointer" />
                  </a>
                  </Tooltip>
                  {linkable? <Tooltip title="Link to Card">
                                <LinkIcon cursor="pointer" onClick={()=> linkCard(record)} />
                              </Tooltip>: <></>
                  }
                  {linkable? <Tooltip title="Bookmark Card">
                                <BookmarkIcon cursor="pointer" onClick={()=> startBookmark(record)} />
                              </Tooltip>: <></>
                  }
                </Space>
              </IconContext.Provider>
            ),
          },
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'id',
            render: (text,record) => (<Link  to={linkPrefix + record.id}>{record.name || ""}</Link>)
          },
        ];
      }    
      
      const albumColumns = makeColumns("/albums/"); 

return <PagedTable columns={albumColumns as any} pagedList={pagedAlbumList} rowKey="id" />;
}