import Layout from '../../components/layout'
import { Button, Row, Col } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useState } from 'react';
import LinkDialog from '../../components/LinkDialog';
import TopTable from '../../components/TopTable';
import { FaLink as LinkIcon } from 'react-icons/fa';
import {BsFillBookmarkFill as BookmarkIcon } from 'react-icons/bs';
import { useParams } from 'react-router-dom';
import { signIn, useSession } from '../../lib/auth';
import { bookmarkContent } from '../../lib/bookmarkActions';
import { Playlist, PlaylistEntry } from '../../lib/musicDataTypes';
import { CardAction, linkCardToContent } from '../../lib/cardActions';
import { usePlaylist } from '../../lib/loaders';



// This gets called on every request
// export async function getServerSideProps(ctx) {
//   let session = await getSession(ctx) 
//   let detail:PlaylistDetailData = undefined
//   if(session && session.token.accessToken) {
//     const response = await getPlaylistContent(session.token.accessToken,ctx.params.id);
//     detail = (await response.json());  
//   }
//   return { props: detail }
// }

export default function PlaylistDetails() {
  
  let { id } = useParams();
  const { data: session } = useSession()
  const {playlist,error} = usePlaylist(session?.token,id)
  const [linkAction,setLinkAction] = useState<CardAction|undefined>(undefined);

  const startBookmark = async(playlist:Playlist) => {
    await bookmarkContent(playlist.id,{
      url:playlist.external_urls.spotify,
      title:playlist.name,
      cover:playlist.images[0]?.url,
      details: {
        printed: false,
        artist: "Playlist",
        type:"playlist",
        
      }
    });
  }

  const linkCard = async (playlist:Playlist) => {
    let action = linkCardToContent({
      url:playlist.external_urls.spotify,
      title:playlist.name,
      cover:playlist.images[0]?.url,
      details: {
        printed: false,
        artist: "Playlist",
        type:"playlist",
        
      }
    });
    setLinkAction(action);
    action.promise!.finally(()=> setLinkAction(undefined))
  }

  const columns: ColumnsType<PlaylistEntry> = [
    {
      title: '',
      key: 'id',
      align: 'right',
      width: 100,
      render: (text,record) => <img src={record.track.album.images[0]?.url} width="50" />
    },
    {
      title: 'Name',
      dataIndex: 'track.name',
      key: 'id',
      render: (text,record) => <>{record.track.name}</>
    }
  ];
  
  if (session) {
    return (
    <section>
        { playlist? 
          <>
            <Row>
              <Col>
              <img src={playlist.images[0].url} width="150" />
            </Col>
            <Col style={{paddingLeft: 10}}>
              <h2>{playlist.name}</h2>      
              <h2 style={{marginTop:-10, marginBottom:20}} dangerouslySetInnerHTML={{ __html:playlist.description}} />
              <Button type="primary"  icon={<LinkIcon style={{marginTop:4}} />} style={{marginRight:2}} onClick={()=>linkCard(playlist)}></Button>
                <Button type="primary"  icon={<BookmarkIcon style={{marginTop:4}} />} onClick={()=>startBookmark(playlist)}></Button>
            </Col>
            </Row>
            <Row>
              <Col span={24}>
                <TopTable columns={columns} rowKey="id" dataSource={playlist.tracks.items} />          
                <LinkDialog action={linkAction} />
              </Col>
            </Row>
          </>
        : "loading..."
    }
    </section>
  )
  }
  return (
    <section>
      <h1>Playlist Details</h1>      
      <p>Sign in to see details</p>
      <Button type="primary" onClick={()=>{signIn()}}>Sign in</Button>
    </section>
  )

}
