import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import { getSession, useSession, signIn, signOut } from "next-auth/react"
import {getUsersPlaylists} from '../lib/spotify';
import { Table, Space } from 'antd';
import { ColumnsType } from 'antd/lib/table';


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
    key: 'key',
  },
  {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
      <Space size="middle">
        <a>♂</a>
        <a>🔨</a>
      </Space>
    ),
  },
];


// This gets called on every request
export async function getServerSideProps(ctx) {
  // Fetch data from external API
//  const res = await fetch(`https://.../data`)
//  const data = await res.json()
  let session = await getSession(ctx) 
  let items = []
  console.log("session is",session);
  if(session && session.token.accessToken) {
    const response = await getUsersPlaylists(session.token.accessToken);
    items = (await response.json()).items;  
  }
  return { props: { items } }
}

export default function Playlists({items}) {
  const { data: session } = useSession()
  if (session) {
    return (
    <section>
      <h2>Playlists</h2>
        <Table columns={columns} pagination={{/*pageSize: 15*/}} dataSource={items} />
      {/* <ul>
        {
          items.map(item => (
            <li key={item.id}>
              <img src={item.images[0]?.url} width="30" />
              <a href={item.external_urls.spotify}>{item.name}</a>
            </li>
          )
          )
        }
      </ul> */}
    </section>
  )
  }
  return (
    <section>
      <h2>Playlists</h2>
      Not signed in <br />
      <button onClick={() => signIn('spotify')}>Sign in</button>
    </section>
  )

}

Playlists.getLayout = function getLayout(page) {
  return (
    <Layout>
      <Sidebar />
      {page}
    </Layout>
  )
}
