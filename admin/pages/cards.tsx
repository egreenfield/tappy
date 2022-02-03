import Layout from '../components/layout'
import { getSession, useSession, signIn, signOut } from "next-auth/react"
import {getUsersPlaylists} from '../lib/spotify';
import { Table, Space, Button, Modal, Tooltip, Popconfirm, message, Row, Col } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';
import { CardData, getCurrentCards, startLinkAction, unlinkCard } from '../lib/cardActions';
import LinkDialog from '../components/LinkDialog';
import Link from 'next/link';
import { TiDelete} from 'react-icons/ti';
import { BsQuestionSquare} from 'react-icons/bs';
import { AiFillQuestionCircle } from 'react-icons/ai';
import { IconContext } from 'react-icons/lib';
import TopTable from '../components/TopTable';


// This gets called on every request
export async function getServerSideProps(ctx) {
  let cards = await getCurrentCards();
  return { props: { cards } }
}

interface CardsProps {
  cards:CardData[]
}
export default function Cards({cards}:CardsProps) {
  const [linkAction,setLinkAction] = useState(undefined);
  const [modifiedCards,setModifiedCards] = useState(cards);

  const linkCard = async (record) => {
    let action = startLinkAction({
      url:record.external_urls.spotify,
      title:record.name,
      cover:record.images[0]?.url,
      details: {
        printed: false,
        type: "playlist"
      }
    });
    setLinkAction(action);
    action.promise.finally(()=> setLinkAction(undefined))
  }

  const startUnlinkCard = async (card:CardData) => {

    message.loading({content: "Removing...",key:"deleting"});
    await unlinkCard(card);
    message.success({content: "Success", duration: 3,key:"deleting"});
    setModifiedCards(modifiedCards.filter(v => v != card));
  }

  const identifyCard = async () => {

  }
  const columns: ColumnsType<CardData> = [
    {
      title: '',
      key: 'key',
      align: 'right',
      width: 60,
      render: (text,record) => <img src={record.cover} width="50" />
    },
    {
      title: '',
      width: 100,
      key: 'id',
      align: "center",
      render: (text, record) => {
        return (<IconContext.Provider value={{ color: "#FF7777" }}>
          <Space size="middle">
            <Popconfirm
              title="Erase this card?"
              okText="Yes"
              cancelText="No"
              onConfirm={()=>startUnlinkCard(record)}
              >
              <TiDelete  cursor="pointer"  />
            </Popconfirm>
          </Space>
        </IconContext.Provider>
      )},
    },
    {
      title: 'Name',
      dataIndex: 'title',
      key: 'id',
      render: (text,record) => (<Link  href={`/playlists/${record.id}`}>{text}</Link>)
    },
  ];
  
    return (
    <>
      <Row>
          <Col span={24}>
          <h1>Cards <Button type='primary' onClick={identifyCard} style={{marginLeft: 30, paddingTop: 6, paddingLeft:10, paddingRight:10}} ><AiFillQuestionCircle  /> </Button></h1>
          </Col>
      </Row>
      <section>
      <Row>
        <Col span={11}>
        <h1>Playlists </h1>
          <TopTable columns={columns}           
            dataSource={modifiedCards.filter(c=>c.details.type != "album")} />          
        </Col>
        <Col span={1}>
        </Col>
        <Col span={12}>
        <h1>Albums</h1>
          <TopTable columns={columns} 
            dataSource={modifiedCards.filter(c=>c.details.type == "album")} />          
        <LinkDialog action={linkAction} />
        </Col>
    </Row>
      </section>
      </>
  )  
}

Cards.getLayout = function getLayout(page) {
  return (
    <Layout selected='cards'>{page}</Layout>
  )
}
