import { Avatar, Button, Col, ConfigProvider, Input, List, Row, Tabs } from 'antd'
import { ChangeEvent, KeyboardEvent, useState } from 'react'
import { RiSearchLine as SearchIcon } from 'react-icons/ri';
import { isSignedIn, signIn } from '../lib/auth';
import { Artist,Album,Track, Playlist } from '../lib/musicDataTypes';
import { searchContent } from '../lib/search';

export default function Search() {

  const [artists,setArtists] = useState<Artist[]>([]);
  const [albums,setAlbums] = useState<Album[]>([]);
  const [tracks,setTracks] = useState<Track[]>([]);
  const [playlists,setPlaylists] = useState<Playlist[]>([]);
  const [tab,setTab] = useState(["Artists"]);
  const [searchText,setSeachText] = useState("");

  const handleSearch = async () => {
    let results = await searchContent(searchText)
    setArtists(results.artists!);
    setAlbums(results.albums!);
    setTracks(results.tracks!);
    setPlaylists(results.playlists!);
  }

  const handleSearchChange = async (event:ChangeEvent<HTMLInputElement>) => {
    let text = (event.target as any).value;
    setSeachText(text);
    handleSearch();
  }
  const customizeRenderEmpty = () => (<></>
  );
  

  if (isSignedIn()) {
  return (
    <Row>
      <Col span={24}>
        <Col span={8}>
          <h2>Find New Music</h2>
            <Row gutter={5} style={{flexWrap: "nowrap", }}>
              <Input style={{display:"inline", marginRight:10}} value={searchText} onChange={handleSearchChange} onPressEnter={handleSearch}/>
               <Button style={{display:"inline"}} onClick={handleSearch} type="primary"><SearchIcon style={{marginTop:5, marginLeft:-3, marginRight:-3}} /></Button>
              </Row>
        </Col>        
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
            />
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
              />
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
                />
              </Col>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Playlists" key="Playlists">
            <Col span={24}>
              <List
              bordered
              itemLayout="horizontal"
              dataSource={playlists}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.images?.length? item.images[0].url : ""} />}
                    title={<a href={`/playlists/${item.id}`}>{item.name}</a>}
                  />
                </List.Item>
                )}
              />
            </Col>
            </Tabs.TabPane>
          </Tabs>
          </Col>
        </Row>
        </ConfigProvider>
      </Col>
    </Row>
  )
}
return (
  <section>
    <h2>Music</h2>
    Not signed in <br />
    <button onClick={() => signIn()}>Sign in</button>
  </section>
)

}

