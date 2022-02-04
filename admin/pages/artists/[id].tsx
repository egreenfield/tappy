import Layout from '../../components/layout'
import { getSession, useSession, signIn, signOut } from "next-auth/react"
import {AlbumData, ArtistDetail, getArtistDetail, getPlaylistContent, getUsersPlaylists} from '../../lib/spotify';
import { Table, Space, Button, Modal, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';
import { linkCardToContent } from '../../lib/cardActions';
import LinkDialog from '../../components/LinkDialog';
import { FaLink as LinkIcon, FaExternalLinkAlt as Navigate } from 'react-icons/fa';
import { IconContext } from 'react-icons/lib';
import Link from 'next/link';
import TopTable from '../../components/TopTable';


// This gets called on every request
export async function getServerSideProps(ctx) {
  let session = await getSession(ctx) 
  let detail:ArtistDetail = undefined;
  if(session && session.token.accessToken) {
    detail = await getArtistDetail(session.token.accessToken,ctx.params.id);
  }
  return { props: detail || {} }
}

export default function ArtistDetails(detail:ArtistDetail) {

    const { data: session } = useSession()
   const [linkAction,setLinkAction] = useState(undefined);

  const linkCard = async (playlist:AlbumData) => {
    let action = linkCardToContent({
      url:playlist.external_urls.spotify,
      title:playlist.name,
      cover:playlist.images[0]?.url,
      details: {
        printed: false,
        type:"album"
      }
    });
    setLinkAction(action);
    action.promise.finally(()=> setLinkAction(undefined))
  }

  const columns: ColumnsType<AlbumData> = [
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
        render: (text,record) => <Link href={`/albums/${record.id}`}>{record.name}</Link>
      },
      ];
  
  if (session) {
    return (
    <section>
        <img src={detail.images[0].url} width="150" />
        <h1>{detail.name}</h1>      
        <TopTable columns={columns} dataSource={detail.albums} />          
        <LinkDialog action={linkAction} />
    </section>
  )
  }
  return (
    <section>
      <h1>Artist Details</h1>      
      <p>Sign in to see details</p>
      <Button type="primary" onClick={()=>{signIn("spotify")}}>Sign in</Button>
    </section>
  )

}

ArtistDetails.getLayout = function getLayout(page) {
  return (
    <Layout selected='music'>{page}</Layout>
  )
}