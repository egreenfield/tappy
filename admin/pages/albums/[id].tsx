import Layout from '../../components/layout'
import { getSession, useSession, signIn, signOut } from "next-auth/react"
import {AlbumData, getAlbumDetail, TrackData} from '../../lib/spotify';
import { Table, Space, Button, Modal, Row, Col } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';
import { startLinkAction } from '../../lib/cardActions';
import LinkDialog from '../../components/LinkDialog';
import TopTable from '../../components/TopTable';


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

  const linkCard = async (album:AlbumData) => {
    let action = startLinkAction({
      url:album.external_urls.spotify,
      title:album.name,
      cover:album.images[0]?.url,
      details: {
        printed: false,
        type: "album"
      }
    });
    setLinkAction(action);
    action.promise.finally(()=> setLinkAction(undefined))
  }

  const columns: ColumnsType<TrackData> = [
    {
      title: 'Track',
      dataIndex: 'track.name',
      key: 'id',
      render: (text,record) => <>{record.name}</>
    }
  ];
  
  if (session) {
    return (
    <section>
        <Row>
          <Col>
            <img src={album.images[0].url} width="150" />
          </Col>
          <Col style={{paddingLeft: 10}}>
            <h1>{album.name}</h1>      
            <Button type="primary" onClick={()=>linkCard(album)}>Link Card</Button>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <TopTable columns={columns} dataSource={album.tracks} />          
            <LinkDialog action={linkAction} />
          </Col>
        </Row>

    </section>
  )
  }
  return (
    <>
      <h1>Album Details</h1>      
      <section>
        <p>Sign in to see details</p>
        <Button type="primary" onClick={()=>{signIn("spotify")}}>Sign in</Button>
      </section>
    </>
  )

}

AlbumDetails.getLayout = function getLayout(page) {
  return (
    <Layout selected='music'>{page}</Layout>
  )
}
