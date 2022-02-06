import Layout from '../components/layout'
import { getSession, useSession, signIn, signOut } from "next-auth/react"
import {getUsersPlaylists} from '../lib/server/spotify';
import { Table, Space, Button, Tooltip, Tabs, Row, Col, Divider } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useState } from 'react';
import { linkCardToContent } from '../lib/client/cardActions';
import LinkDialog from '../components/LinkDialog';
import Link from 'next/link';
import { FaLink as LinkIcon, FaExternalLinkAlt as Navigate } from 'react-icons/fa';
import { IconContext } from 'react-icons/lib';
import TopTable from '../components/TopTable';
import useSWR from 'swr';
import { useLibrary } from '../lib/client/loaders';


interface PlaylistData {
  key: number;  
  id:string;
  name: string;
  external_urls: {spotify:string}
  images: {url:string}[]
}


export default function Playlists() {
  const { data: session } = useSession()
  const [linkAction,setLinkAction] = useState(undefined);
  const {music,error} = useLibrary();


  async function linkCard(record):Promise<void> {
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
    action.promise.finally(()=> setLinkAction(undefined))
  }

  const makeColumns = (linkPrefix:string,linkable:boolean=true): ColumnsType<PlaylistData> => {
    return [
      {
        title: '',
        key: 'key',
        align: 'right',
        width: 60,
        render: (text,record) => <img src={record.images?.length? record.images[0].url:""} width="50" />
      },
      {
        title: '',
        width: 60,
        key: 'id',
        render: (text, record) => (
          <IconContext.Provider value={{ color: "#7777FF" }}>
            <Space size="middle">
              <Tooltip title="Open in Spotify">
                <Navigate cursor="pointer" onClick={()=> window.location.href = record.external_urls.spotify}/>
              </Tooltip>
              {linkable? <Tooltip title="Link to Card">
                            <LinkIcon cursor="pointer" onClick={()=> linkCard(record)} />
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
        render: (text,record) => (<Link  href={linkPrefix + record.id}>{record.name || ""}</Link>)
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
      <Button type="primary" onClick={()=>{signIn("spotify")}}>Sign in</Button>
    </section>
  )

}

Playlists.getLayout = function getLayout(page) {
  return (
    <Layout selected='playlists'>{page}</Layout>
  )
}
