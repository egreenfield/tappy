import Layout from '../components/layout'
import { getSession, useSession, signIn, signOut } from "next-auth/react"
import {getUsersPlaylists} from '../lib/spotify';
import { Table, Space, Button, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';
import { startLinkAction } from '../lib/cardActions';
import LinkDialog from '../components/LinkDialog';
import Link from 'next/link';
import { FaLink as LinkIcon, FaExternalLinkAlt as Navigate } from 'react-icons/fa';
import { IconContext } from 'react-icons/lib';


interface PlaylistData {
  key: number;  
  id:string;
  name: string;
  external_urls: {spotify:string}
  images: {url:string}[]
}

// This gets called on every request
export async function getServerSideProps(ctx) {
  let session = await getSession(ctx) 
  let items = []
  if(session && session.token.accessToken) {
    const response = await getUsersPlaylists(session.token.accessToken);
    items = (await response.json()).items;  
  }
  return { props: { items } }
}

export default function Playlists({items}) {
  const { data: session } = useSession()
  const [linkAction,setLinkAction] = useState(undefined);

  const linkCard = async (record) => {
    let action = startLinkAction({
      url:record.external_urls.spotify,
      title:record.name,
      cover:record.images[0]?.url,
      details: {
        printed: false
      }
    });
    setLinkAction(action);
    action.promise.finally(()=> setLinkAction(undefined))
  }

  const columns: ColumnsType<PlaylistData> = [
    {
      title: '',
      key: 'key',
      align: 'right',
      width: 60,
      render: (text,record) => <img src={record.images[0]?.url} width="50" />
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'id',
      render: (text,record) => (<Link  href={`/playlists/${record.id}`}>{text}</Link>)
    },
    {
      title: 'Action',
      key: 'id',
      render: (text, record) => (
        <IconContext.Provider value={{ color: "#7777FF" }}>
          <Space size="middle">
              <Navigate onClick={()=> window.location.href = record.external_urls.spotify}/>
              <LinkIcon onClick={()=> linkCard(record)} />
          </Space>
        </IconContext.Provider>
      ),
    },
  ];
  
  if (session) {
    return (
    <section>
      <h1>Playlists</h1>
        <Table columns={columns} pagination={{/*pageSize: 15*/}} dataSource={items} />          
      <LinkDialog action={linkAction} />
    </section>
  )
  }
  return (
    <section>
      <h1>Playlists</h1>
      <p>Sign in to see your playlists</p>
      <Button type="primary" onClick={()=>{signIn("spotify")}}>Sign in</Button>
    </section>
  )

}

Playlists.getLayout = function getLayout(page) {
  return (
    <Layout selected='playlists'>{page}</Layout>
  )
}
