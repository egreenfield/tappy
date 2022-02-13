import {  Space, Button, Popconfirm, message, Row, Col } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';
import { CardAction, identifyCardContent, unlinkCard } from '../lib/cardActions';
import { TiDelete} from 'react-icons/ti';
import { AiFillQuestionCircle } from 'react-icons/ai';
import { BsPrinter } from 'react-icons/bs';

import { IconContext } from 'react-icons/lib';
import TopTable from '../components/TopTable';
import CardInfoDialog from '../components/CardInfoDialog';
import { useCurrentCards } from '../lib/loaders';
import { CardData } from '../lib/tappyDataTypes';
import { filterByList } from '../lib/utils';
import PrintPanel from '../components/PrintPanel';



export default function Cards() {
  const [cardAction,setCardAction] = useState<CardAction|undefined>(undefined);
  const [modifiedCards,setModifiedCards] = useState<CardData[]>([]);
  const [playlistRows,setPlaylistRows] = useState<string[]>([]);
  const [albumRows,setAlbumRows] = useState<string[]>([]);
  const [showPrint,setShowPrint] = useState<boolean>(false);
  const [cardsToPrint,setCardsToPrint] = useState<CardData[]|undefined>(undefined);

  let {cards} = useCurrentCards();

  useEffect(()=> {
    if(cards) {
      setModifiedCards(cards);
    }
  },[cards])

  const startUnlinkCard = async (card:CardData) => {

    message.loading({content: "Removing...",key:"deleting"});
    await unlinkCard(card);
    message.success({content: "Success", duration: 3,key:"deleting"});
    setModifiedCards(modifiedCards.filter(v => v.id !== card.id));
  }
  const printCards = ()=> {
    let toPrint = playlistRows.concat(albumRows);
    setShowPrint(!showPrint);
    setCardsToPrint(filterByList(modifiedCards,"id",toPrint as string[]));

  }

  const identifyCard = async () => {
    let action = identifyCardContent();
    setCardAction(action);
    action.promise!.then(()=> {
      setCardAction({...action});
    }).catch(()=> {
      setCardAction(undefined);
    })
  }
  const dismissDialog = () => {
    setCardAction(undefined);
  }

  const columns: ColumnsType<CardData> = [
    {
      title: '',
      align: 'right',
      width: 60,
      render: (text,record) => <img src={record.content.cover} width="50" alt="" />
    },
    {
      title: '',
      width: 100,
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
      render: (text,record) => (<>{record.content.title}</>)
    },
  ];
  
    return (
    <>
      <Row>
          <Col span={24}>
          <h1>Cards 
            <Button type='primary' onClick={identifyCard} style={{marginLeft: 30, paddingTop: 6, paddingLeft:10, paddingRight:10}} ><AiFillQuestionCircle  /> 
            </Button>
            <Button 
              type='primary' 
              disabled={playlistRows.length === 0 && albumRows.length === 0}
              onClick={printCards} style={{marginLeft: 5, paddingTop: 6, paddingLeft:10, paddingRight:10}} ><BsPrinter  /> 
            </Button>
            </h1>
          </Col>
      </Row>
      <PrintPanel active={showPrint} cardsToPrint={cardsToPrint}/>
      <section>
      <Row>
        <Col span={11}>
        <h1>Playlists </h1>
          <TopTable columns={columns} rowKey="id"
            rowSelection={{type:"checkbox",selectedRowKeys:playlistRows,onChange:(rows:string[])=>setPlaylistRows(rows)}}
            dataSource={modifiedCards.filter(c=>c.content.details.type !== "album")} />          
        </Col>
        <Col span={1}>
        </Col>
        <Col span={12}>
        <h1>Albums</h1>
          <TopTable columns={columns} rowKey="id"
            rowSelection={{type:"checkbox",selectedRowKeys:albumRows,onChange:(rows:string[])=>setAlbumRows(rows)}}
            dataSource={modifiedCards.filter(c=>c.content.details.type === "album")} />          
        <CardInfoDialog action={cardAction} onComplete={dismissDialog}/>
        </Col>
    </Row>
      </section>
      </>
  )  
}