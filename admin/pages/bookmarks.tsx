import Layout from '../components/layout'
import { getSession, useSession, signIn, signOut } from "next-auth/react"
import {getUsersPlaylists} from '../lib/server/spotify';
import { Table, Space, Button, Modal, Tooltip, Popconfirm, message, Row, Col } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';
import { CardData, identifyCardContent, sendCardPrintJob, unlinkCard } from '../lib/client/cardActions';
import LinkDialog from '../components/LinkDialog';
import Link from 'next/link';
import { TiDelete} from 'react-icons/ti';
import { BsQuestionSquare} from 'react-icons/bs';
import { AiFillQuestionCircle } from 'react-icons/ai';
import { BsPrinter } from 'react-icons/bs';

import { IconContext } from 'react-icons/lib';
import { FaLink as LinkIcon } from 'react-icons/fa';
import TopTable from '../components/TopTable';
import CardInfoDialog from '../components/CardInfoDialog';
import { getCurrentCards } from '../lib/server/serverCardActions';
import { getBookmarks } from '../lib/server/serverBookmarks';


// This gets called on every request
export async function getServerSideProps(ctx) {
  let bookmarks = await getBookmarks();
  return { props: { bookmarks } }
}

interface BookmarksProps {
  bookmarks:CardData[]
}
export default function Bookmarks({bookmarks}:BookmarksProps) {
  const [modifiedBookmarks,setModifiedBookmarks] = useState(bookmarks);
  const [playlistRows,setPlaylistRows] = useState([]);
  const [albumRows,setAlbumRows] = useState([]);

  const printBookmarks = ()=> {
    console.log("printing",playlistRows,albumRows);
    let toPrint = playlistRows.concat(albumRows);
    sendCardPrintJob(toPrint,"bookmark");
  }


  const columns: ColumnsType<CardData> = [
    {
      title: '',
      align: 'right',
      width: 60,
      render: (text,record) => <img src={record.content.cover} width="50" />
    },
    {
      title: '',
      width: 100,
      align: "center",
      render: (text, record) => {
        return (<IconContext.Provider value={{ color: "#7777FF" }}>
          <Space size="middle">
              <LinkIcon cursor="pointer"  />
          </Space>
        </IconContext.Provider>
      )},
    },
    {
      title: 'Name',
      dataIndex: 'title',
      render: (text,record) => (<>{record.content.title}</>)
    },
  ];
  
    return (
    <>
      <Row>
          <Col span={24}>
          <h1>Bookmarks
            <Button 
              type='primary' 
              disabled={playlistRows.length == 0 && albumRows.length == 0}
              onClick={printBookmarks} style={{marginLeft: 5, paddingTop: 6, paddingLeft:10, paddingRight:10}} ><BsPrinter  /> 
            </Button>
            </h1>
          </Col>
      </Row>
      <section>
      <Row>
        <Col span={11}>
        <h1>Playlists </h1>
          <Table columns={columns} rowKey="id"
            rowSelection={{type:"checkbox",selectedRowKeys:playlistRows,onChange:(rows)=>setPlaylistRows(rows)}}
            dataSource={modifiedBookmarks.filter(c=>c.content.details.type != "album")} />          
        </Col>
        <Col span={1}>
        </Col>
        <Col span={12}>
        <h1>Albums</h1>
          <Table columns={columns} rowKey="id"
            rowSelection={{type:"checkbox",selectedRowKeys:albumRows,onChange:(rows)=>setAlbumRows(rows)}}
            dataSource={modifiedBookmarks.filter(c=>c.content.details.type == "album")} />          
        </Col>
    </Row>
      </section>
      </>
  )  
}

Bookmarks.getLayout = function getLayout(page) {
  return (
    <Layout selected='cards'>{page}</Layout>
  )
}
