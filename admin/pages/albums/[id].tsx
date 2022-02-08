import Layout from '../../components/layout'
import { getSession, useSession, signIn, signOut } from "next-auth/react"
import {AlbumData, getAlbumDetail, TrackData} from '../../lib/server/spotify';
import { Button, Row, Col } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useState } from 'react';
import {  linkCardToContent } from '../../lib/client/cardActions';
import LinkDialog from '../../components/LinkDialog';
import TopTable from '../../components/TopTable';
import { FaLink as LinkIcon } from 'react-icons/fa';
import {BsFillBookmarkFill as BookmarkIcon } from 'react-icons/bs';
import { bookmarkContent } from '../../lib/client/bookmarkActions';


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

  const startBookmark = async(album:AlbumData) => {
    await bookmarkContent(album.id,{
      url:album.external_urls.spotify,
      title:album.name,
      cover:album.images[0]?.url,
      details: {
        printed: false,
        type: "album",
        "artist": album.artists && album.artists.length? album.artists[0].name:"Unknown"
      }
    });
  }

  const linkCard = async (album:AlbumData) => {
    let action = linkCardToContent({
      url:album.external_urls.spotify,
      title:album.name,
      cover:album.images[0]?.url,
      details: {
        printed: false,
        type: "album",
        "artist": album.artists && album.artists.length? album.artists[0].name:"Unknown"
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
    <>
        <Row>
          <Col>
            <img src={album.images[0].url} width="150" />
          </Col>
          <Col style={{paddingLeft: 10}}>
            <h1>{album.name}</h1>      
            <h4 style={{marginTop:-10, marginBottom:10}}>{album.artists && album.artists.length? album.artists[0].name:""}</h4>      
            <Button type="primary"  icon={<LinkIcon style={{marginTop:4}} />} style={{marginRight:2}} onClick={()=>linkCard(album)}></Button>
            <Button type="primary"  icon={<BookmarkIcon style={{marginTop:4}} />} onClick={()=>startBookmark(album)}></Button>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <TopTable columns={columns} dataSource={album.tracks} />          
            <LinkDialog action={linkAction} />
          </Col>
        </Row>

    </>
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
