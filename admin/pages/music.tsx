import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import { useSession, signIn, signOut } from "next-auth/react"
import { Avatar, Button, Input, List } from 'antd'
import { ChangeEvent, KeyboardEvent, useState } from 'react'
import { searchForArtists } from '../lib/spotify'
import { search } from '../lib/search'

export default function Music() {
  const { data: session } = useSession()

  const [artists,setArtists] = useState([]);
  const [searchText,setSeachText] = useState("");

  const handleSearch = async () => {
    let results = await search(searchText)
    setArtists(results);
  }

  const handleSearchChange = async (event:ChangeEvent<HTMLInputElement>) => {
    let text = (event.target as any).value;
    setSeachText(text);
    handleSearch();
  }


  if (session) {
  return (
    <section>
      <h2>Music</h2>
      <p>search:
        <Input value={searchText} onChange={handleSearchChange} onPressEnter={handleSearch}/>
        <Button onClick={handleSearch}>Search</Button>
      </p>
      <List
        itemLayout="horizontal"
        dataSource={artists}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={item.images?.length? item.images[0].url : ""} />}
              title={<a href={`/artists/${item.id}`}>{item.name}</a>}
            />
          </List.Item>
        )}
      />,
    </section>
  )
}
return (
  <section>
    <h2>Music</h2>
    Not signed in <br />
    <button onClick={() => signIn('spotify')}>Sign in</button>
  </section>
)

}

Music.getLayout = function getLayout(page) {
  return (
    <Layout selected='music'>{page}</Layout>
  )
}
