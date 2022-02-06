import Layout from '../../components/layout'
import { getSession, useSession, signIn, signOut } from "next-auth/react"
import {AlbumData, getPlaylistContent, getUsersPlaylists} from '../../lib/server/spotify';
import { Table, Space, Button, Modal, Row, Col } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';
import { linkCardToContent } from '../../lib/client/cardActions';
import LinkDialog from '../../components/LinkDialog';
import TopTable from '../../components/TopTable';

interface TrackData {
    name:string;
    is_local:boolean;
    album:AlbumData
}
interface PlaylistEntryData {
    track: TrackData;
}

interface PlaylistDetailData {
  key: number;  
  name: string;
  description: string;
  images: {url:string}[]
  tracks: {items:PlaylistEntryData[]}
  external_urls:{spotify:string}
}

// This gets called on every request
export async function getServerSideProps(ctx) {
  let session = await getSession(ctx) 
  let detail:PlaylistDetailData = undefined
  if(session && session.token.accessToken) {
    const response = await getPlaylistContent(session.token.accessToken,ctx.params.id);
    detail = (await response.json());  
  }
  return { props: detail }
}

export default function PlaylistDetails(playlist:PlaylistDetailData) {
  const { data: session } = useSession()
  const [linkAction,setLinkAction] = useState(undefined);

  const linkCard = async (playlist:PlaylistDetailData) => {
    let action = linkCardToContent({
      url:playlist.external_urls.spotify,
      title:playlist.name,
      cover:playlist.images[0]?.url,
      details: {
        printed: false,
        artist: "Playlist",
        type:"playlist",
        
      }
    });
    setLinkAction(action);
    action.promise.finally(()=> setLinkAction(undefined))
  }

  const columns: ColumnsType<PlaylistEntryData> = [
    {
      title: '',
      key: 'key',
      align: 'right',
      width: 100,
      render: (text,record) => <img src={record.track.album.images[0]?.url} width="50" />
    },
    {
      title: 'Name',
      dataIndex: 'track.name',
      key: 'id',
      render: (text,record) => <>{record.track.name}</>
    }
  ];
  
  if (session) {
    return (
    <section>
        <Row>
          <Col>
          <img src={playlist.images[0].url} width="150" />
        </Col>
        <Col style={{paddingLeft: 10}}>
          <h2>{playlist.name}</h2>      
          <h1 style={{marginTop:-10, marginBottom:20}}>{playlist.description}</h1>      
          <Button type="primary" onClick={()=>linkCard(playlist)}>Link Card</Button>
        </Col>
        </Row>
        <Row>
          <Col span={24}>
            <TopTable columns={columns} dataSource={playlist.tracks.items} />          
            <LinkDialog action={linkAction} />
          </Col>
        </Row>
    </section>
  )
  }
  return (
    <section>
      <h1>Playlist Details</h1>      
      <p>Sign in to see details</p>
      <Button type="primary" onClick={()=>{signIn("spotify")}}>Sign in</Button>
    </section>
  )

}

PlaylistDetails.getLayout = function getLayout(page) {
  return (
    <Layout selected='playlists'>{page}</Layout>
  )
}
