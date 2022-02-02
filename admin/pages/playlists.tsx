import Layout from '../components/layout'
import { getSession, useSession, signIn, signOut } from "next-auth/react"
import {getUsersPlaylists} from '../lib/spotify';
import { Table, Space, Button } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useState } from 'react';
import { json } from 'stream/consumers';


interface PlaylistData {
  key: number;
  
  name: string;
  images: {url:string}[]
}

const columns: ColumnsType<PlaylistData> = [
  {
    title: '',
    key: 'key',
    align: 'right',
    render: (text,record) => <img src={record.images[0]?.url} width="50" />
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'id',
  },
  {
    title: 'Action',
    key: 'id',
    render: (text, record) => (
      <Space size="middle">
        <a>♂</a>
        <a onClick={()=> linkCard(record)}>🔨</a>
      </Space>
    ),
  },
];




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
  const [linkData,setLinkData] = useState(undefined);


  const linkCard = async (record) => {
    console.log(`linking record: ${record}`)
    let response = await fetch('/api/card/link',{
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({
        url:record.external_urls.spotify,
        title:record.name,
        cover:record.images[0]?.url,
        details: {
          printed: false
        }
      })
    })  
    let result = await response.json()
    setLinkData(result);
  }


  if (session) {
    return (
    <section>
      <h1>Playlists</h1>
        <Table columns={columns} pagination={{/*pageSize: 15*/}} dataSource={items} />      
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
