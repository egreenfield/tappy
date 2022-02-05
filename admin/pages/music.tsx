import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import { useSession, signIn, signOut } from "next-auth/react"
import { Avatar, Button, Col, ConfigProvider, Input, List, Row, Tabs } from 'antd'
import { ChangeEvent, KeyboardEvent, useState } from 'react'
import { searchForArtists } from '../lib/spotify'
import { search } from '../lib/search'

export default function Music() {
  const { data: session } = useSession()

  const [artists,setArtists] = useState([]);
  const [albums,setAlbums] = useState([]);
  const [tracks,setTracks] = useState([]);
  const [tab,setTab] = useState(["Artists"]);
  const [searchText,setSeachText] = useState("");

  const handleSearch = async () => {
    let results = await search(searchText)
    setArtists(results.artists);
    setAlbums(results.albums);
    setTracks(results.tracks);
  }

  const handleSearchChange = async (event:ChangeEvent<HTMLInputElement>) => {
    let text = (event.target as any).value;
    setSeachText(text);
    handleSearch();
  }
  const customizeRenderEmpty = () => (<></>
  );
  

  if (session) {
  return (
    <section>
      <h2 >Music</h2>
      <p>search:
        <Input value={searchText} onChange={handleSearchChange} onPressEnter={handleSearch}/>
        <Button onClick={handleSearch}>Search</Button>
      </p>
      <ConfigProvider renderEmpty={customizeRenderEmpty}>
      <Row>
        <Col span={24}>
        <Tabs defaultActiveKey='"Artists'>
          <Tabs.TabPane tab="Artists" key="Artists">
            <Col span={24}>
            <List 
            bordered
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
          </Col>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Albums" key="Albums">
          <Col span={24}>
            <List
            bordered
            itemLayout="horizontal"
            dataSource={albums}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar src={item.images?.length? item.images[0].url : ""} />}
                  title={<a href={`/albums/${item.id}`}>{item.name}</a>}
                />
               </List.Item>
              )}
            />,
          </Col>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Tracks" key="Tracks">
            <Col span={24}>
            <List
            bordered
            itemLayout="horizontal"
            dataSource={tracks}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar src={item.album?.images?.length? item.album.images[0].url : ""} />}
                  title={<a href={`/albums/${item.album?.id}`}>{item.name}</a>}
                />
                </List.Item>
              )}
              />,
            </Col>
          </Tabs.TabPane>
        </Tabs>
        </Col>
      </Row>
      </ConfigProvider>
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
