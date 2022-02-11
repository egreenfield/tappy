import { Table, Space, Button, Tooltip, Tabs, Row, Col } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useState } from 'react';
import { CardAction, linkCardToContent } from '../lib/cardActions';
import LinkDialog from '../components/LinkDialog';
import { FaLink as LinkIcon, FaExternalLinkAlt as Navigate } from 'react-icons/fa';
import {BsFillBookmarkFill as BookmarkIcon } from 'react-icons/bs';

import { IconContext } from 'react-icons/lib';
import { useLibrary } from '../lib/loaders';
import { bookmarkContent } from '../lib/bookmarkActions';
import { signIn, useSession } from '../lib/auth';
import { Entity } from '../lib/musicDataTypes';
import { Link } from 'react-router-dom';


interface PlaylistData {
  key: number;  
  id:string;
  name: string;
  external_urls: {spotify:string}
  images: {url:string}[]
}


export default function MyMusic() {
  const { data: session } = useSession()
  const [linkAction,setLinkAction] = useState<CardAction|undefined>(undefined);
  const {music,error} = useLibrary(session?.token);

  
  async function startBookmark(record:Entity) {
    await bookmarkContent(record.id,{
      url:record.external_urls.spotify,
      title:record.name,
      cover:record.images[0]?.url,
      details: {
        printed: false,
        artist: "Playlist",
        type: "playlist"
      }
    });
  }

  async function linkCard(record:Entity):Promise<void> {
    let action = linkCardToContent({
      url:record.external_urls.spotify,
      title:record.name,
      cover:record.images[0]?.url,
      details: {
        printed: false,
        artist: "Playlist",
        type: "playlist"
      }
    });
    setLinkAction(action);
    action.promise!.finally(()=> setLinkAction(undefined))
  }

  const makeColumns = (linkPrefix:string,linkable:boolean=true): ColumnsType<PlaylistData> => {
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
              <a href={record.external_urls.spotify} target="_blank">
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

  const playlistColumns = makeColumns("/playlists/"); 
  const albumColumns = makeColumns("/albums/"); 
  const artistColumns = makeColumns("/artists/",false); 

  if (session) {

    if(error) {
      return <div>error!</div>;
    }
    if(!music) {
      return <div>loading...</div>;
    }
    return (
    <Row>
      <Col span={24}>
        <Tabs defaultActiveKey='"Playlists'>
          <Tabs.TabPane tab="Playlists" key="Playlists">
            <Col span={24}>
              <Table columns={playlistColumns} 
                pagination={{ position: ["topRight", "bottomRight"] }} 
                dataSource={music.playlists} rowKey="id" />          
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Albums" key="Albums">
            <Col span={24}>
            <Table columns={albumColumns} 
                pagination={{ position: ["topRight", "bottomRight"] }} 
                dataSource={music.albums} rowKey="id" />          
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Artists" key="Artists">
            <Col span={24}>
            <Table columns={artistColumns} 
                pagination={{ position: ["topRight", "bottomRight"] }} 
                dataSource={music.artists} rowKey="id" />          
            </Col>
          </Tabs.TabPane>
        </Tabs>
      </Col>
      <LinkDialog action={linkAction} />
    </Row>
    )
  }
  return (
    <section>
      <p>Sign in to see your music</p>
      <Button type="primary" onClick={()=>signIn()}>Sign in</Button>
    </section>
  )

}
