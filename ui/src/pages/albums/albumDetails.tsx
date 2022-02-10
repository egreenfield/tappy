import Layout from '../../components/layout'
import { Button, Row, Col } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useState } from 'react';
import LinkDialog from '../../components/LinkDialog';
import TopTable from '../../components/TopTable';
import { FaLink as LinkIcon } from 'react-icons/fa';
import {BsFillBookmarkFill as BookmarkIcon } from 'react-icons/bs';
import { bookmarkContent } from '../../lib/bookmarkActions';
import { useParams } from 'react-router-dom';
import { signIn, useSession } from '../../lib/auth';
import { useAlbum } from '../../lib/loaders';
import { CardAction, linkCardToContent } from '../../lib/cardActions';
import { Album, Track } from '../../lib/musicDataTypes';



export default function AlbumDetails() {
  let { id } = useParams();
  const { data: session } = useSession()
  const {album,error} = useAlbum(session?.token,id);

  const [linkAction,setLinkAction] = useState<CardAction|undefined>(undefined);


  const startBookmark = async(album:Album) => {
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

  const linkCard = async (album:Album) => {
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
    action.promise!.finally(()=> setLinkAction(undefined))
  }

  const columns: ColumnsType<Track> = [
    {
      title: 'Track',
      dataIndex: 'track.name',
      key: 'id',
      render: (text,record) => <>{record.name}</>
    }
  ];
  
  if (session) {
    return (
    album?
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
            <TopTable columns={columns} rowKey="id" dataSource={album.tracks || []} />          
            <LinkDialog action={linkAction} />
          </Col>
        </Row>
    </>
    :
    <div>loading...</div>
    );
  }
  return (
    <>
      <h1>Album Details</h1>      
      <section>
        <p>Sign in to see details</p>
        <Button type="primary" onClick={()=>{signIn()}}>Sign in</Button>
      </section>
    </>
  )

}
