import Layout from '../../components/layout'
import {  Space, Button, Tooltip, Row, Col } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useState } from 'react';
import { CardAction, linkCardToContent } from '../../lib/cardActions';
import LinkDialog from '../../components/LinkDialog';
import { FaLink as LinkIcon, FaExternalLinkAlt as Navigate } from 'react-icons/fa';
import { IconContext } from 'react-icons/lib';
import TopTable from '../../components/TopTable';
import { signIn, useSession } from '../../lib/auth';
import { Link, useParams } from 'react-router-dom';
import { useArtist } from '../../lib/loaders';
import { Album } from '../../lib/musicDataTypes';


export default function ArtistDetails() {

    let { id } = useParams();
    const { data: session } = useSession()
    const {artist,error} = useArtist(session?.token,id);

    const [linkAction,setLinkAction] = useState<CardAction|undefined>(undefined);

  const linkCard = async (album:Album) => {
    let action = linkCardToContent({
      url:album.external_urls.spotify,
      title:album.name,
      cover:album.images[0]?.url,
      details: {
        printed: false,
        type:"album",
        "artist": album.artists && album.artists.length? album.artists[0].name:"Unknown"
      }
    });
    setLinkAction(action);
    action.promise?.finally(()=> setLinkAction(undefined))
  }

  const columns: ColumnsType<Album> = [
    {
      title: '',
      key: 'key',
      align: 'right',
      width: 100,
      render: (text,record) => <img src={record.images[0]?.url} width="50" />
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
                <Tooltip title="Link to Card">
                    <LinkIcon cursor="pointer" onClick={()=> linkCard(record)} />
                </Tooltip>
            </Space>
          </IconContext.Provider>
        ),
      },
      {
        title: 'Album',
        dataIndex: 'track.name',
        key: 'id',
        render: (text,record) => <Link to={`/albums/${record.id}`}>{record.name}</Link>
      },
      ];
  
  if (session) {
    return ( artist?
        <>
            <Row>
            <Col>
                <img src={artist.images[0].url} width="150" />
            </Col>
            <Col style={{paddingLeft: 10}}>
                <h1>{artist.name}</h1>      
            </Col>
            </Row>
            <Row>
                <Col span={24}>
                <TopTable columns={columns} rowKey="id" dataSource={artist.albums || []} />          
                <LinkDialog action={linkAction} />
            </Col>
            </Row>
        </>         
        :
        <div>"loading..."</div>
    )
  }
  return (
    <section>
      <h1>Artist Details</h1>      
      <p>Sign in to see details</p>
      <Button type="primary" onClick={()=>{signIn()}}>Sign in</Button>
    </section>
  )

}