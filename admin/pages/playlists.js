import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import { getSession, useSession, signIn, signOut } from "next-auth/react"
import {getUsersPlaylists} from '../lib/spotify';


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
  return { props: { items,session } }
}

export default function Playlists({items}) {
  const { data: session } = useSession()
  if (session) {
    return (
    <section>
      <h2>Playlists</h2>
        <ul>
        {
          items.map(item => (
            <li key={item.id}>
              <img src={item.images[0]?.url} width="30" />
              <a href={item.external_urls.spotify}>{item.name}</a>
            </li>
          )
          )
        }
      </ul>
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
