import Layout from '../../components/layout'
import { getSession, useSession, signIn, signOut } from "next-auth/react"
import {AlbumData, getAlbumDetail, TrackData} from '../../lib/spotify';
import { Table, Space, Button, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';
import { startLinkAction } from '../../lib/cardActions';
import LinkDialog from '../../components/LinkDialog';


// This gets called on every request
export async function getServerSideProps(ctx) {
  let session = await getSession(ctx) 
  let detail:AlbumData = undefined
  if(session && session.token.accessToken) {
    detail = await getAlbumDetail(session.token.accessToken,ctx.params.id);
  }
  return { props: detail || {} }
}

export default function AlbumDetails(album:AlbumData) {
  const { data: session } = useSession()
  const [linkAction,setLinkAction] = useState(undefined);

  const linkCard = async (playlist:AlbumData) => {
    let action = startLinkAction({
      url:playlist.external_urls.spotify,
      title:playlist.name,
      cover:playlist.images[0]?.url,
      details: {
        printed: false
      }
    });
    setLinkAction(action);
    action.promise.finally(()=> setLinkAction(undefined))
  }

  const columns: ColumnsType<TrackData> = [
    {
      title: 'Name',
      dataIndex: 'track.name',
      key: 'id',
      render: (text,record) => <>{record.name}</>
    }
  ];
  
  if (session) {
    return (
    <section>
        <img src={album.images[0].url} width="150" />
        <h1>{album.name}</h1>      
        <Button type="primary" onClick={()=>linkCard(album)}>Link Card</Button>
        <Table columns={columns} pagination={{/*pageSize: 15*/}} dataSource={album.tracks} />          
        <LinkDialog action={linkAction} />
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

AlbumDetails.getLayout = function getLayout(page) {
  return (
    <Layout selected='playlists'>{page}</Layout>
  )
}
