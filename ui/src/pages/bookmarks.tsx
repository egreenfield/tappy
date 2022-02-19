import { Table, Space, Button, Popconfirm, message, Row, Col } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { useEffect, useState } from 'react';
import { CardAction, linkCardToContent } from '../lib/cardActions';
import LinkDialog from '../components/LinkDialog';
import { TiDelete} from 'react-icons/ti';
import { BsPrinter } from 'react-icons/bs';
import { AiOutlineDelete as DeleteIcon } from 'react-icons/ai';
import { IconContext } from 'react-icons/lib';
import { FaLink as LinkIcon } from 'react-icons/fa';
import { deleteBookmark, deleteBookmarks } from '../lib/bookmarkActions';
import { CardData, CardDataMap, Content } from '../lib/tappyDataTypes';
import { useBookmarks, useMusicToCardMap } from '../lib/loaders';
import { filterByList } from '../lib/utils';
import PrintPanel from '../components/PrintPanel';



export default function Bookmarks() {
  const [modifiedBookmarks,setModifiedBookmarks] = useState<CardData[]>([]);
  const [playlistRows,setPlaylistRows] = useState<React.Key[]>([]);
  const [albumRows,setAlbumRows] = useState<React.Key[]>([]);
  const [showPrint,setShowPrint] = useState<boolean>(false);
  const [cardsToPrint,setCardsToPrint] = useState<CardData[]|undefined>(undefined);
  const {musicToCardMap} = useMusicToCardMap();

  const [linkAction,setLinkAction] = useState<CardAction|undefined>(undefined);


  const opacityFor = (record:CardData,musicToCardMap:CardDataMap|undefined):number => {
    let isLinkable = musicToCardMap === undefined || !(record.content.url in musicToCardMap);
    return isLinkable? 1:.2;
  }

  let {bookmarks} = useBookmarks();

  useEffect(()=> {
    if(bookmarks) {
      setModifiedBookmarks(bookmarks);
    }
  },[bookmarks])

  const printBookmarks = ()=> {
    let toPrint = playlistRows.concat(albumRows);
    setShowPrint(!showPrint);
    setCardsToPrint(filterByList(modifiedBookmarks,"id",toPrint as string[]));
  }
  const deleteAllBookmarks = async () => {
    message.loading({content: "Removing...",key:"deleting"});
    await deleteBookmarks();
    message.success({content: "Success", duration: 3,key:"deleting"});
    setModifiedBookmarks([]);
}

    const removeBookmark = async (bookmark:CardData) => {
        message.loading({content: "Removing...",key:"deleting"});
        await deleteBookmark(bookmark);
        setModifiedBookmarks(modifiedBookmarks.filter(v => v.id !== bookmark.id));
        message.success({content: "Success", duration: 3,key:"deleting"});    
    }

  async function linkCard(record:Content):Promise<void> {
    let action = linkCardToContent({
      url:record.url,
      title:record.title,
      cover:record.cover,
      details: record.details
    });
    setLinkAction(action);
    action.promise!.finally(()=> setLinkAction(undefined))
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
        return (
          <Space size="middle">
              <IconContext.Provider value={{ color: "#FF7777" }}>
                  <TiDelete  cursor="pointer"  onClick={()=> removeBookmark(record)}/>
              </IconContext.Provider>
              <IconContext.Provider value={{ color: "#7777FF" }}>
                <LinkIcon cursor="pointer" style={{opacity:opacityFor(record,musicToCardMap)}} onClick={()=> linkCard(record.content)} />
              </IconContext.Provider>
          </Space>
        
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
      <Row justify="start">
          <Col span={24}>
          <h1>Bookmarks
            <Button 
              type='primary' 
              disabled={playlistRows.length === 0 && albumRows.length === 0}
              onClick={printBookmarks} style={{marginLeft: 5, paddingTop: 6, paddingLeft:10, paddingRight:10}} ><BsPrinter  /> 
            </Button>
            <Popconfirm
              title="Remove all Bookmarks?"
              okText="Yes"
              cancelText="No"
              onConfirm={deleteAllBookmarks}
              >
            <Button 
               style={{marginLeft: 5, paddingTop: 6, paddingLeft:10, paddingRight:10}} ><DeleteIcon  /> 
            </Button>
            </Popconfirm>
            </h1>
          </Col>
      </Row>
      <PrintPanel active={showPrint} cardsToPrint={cardsToPrint}/>
      <Row>
        <Col span={11}>
        <h1>Playlists </h1>
          <Table columns={columns} rowKey="id"
            scroll={{ y: 1100 }} 
            pagination={{ pageSize: 500,  position: []}} 
            rowSelection={{type:"checkbox",selectedRowKeys:playlistRows,onChange:(rows)=>setPlaylistRows(rows)}}
            dataSource={modifiedBookmarks.filter(c=>c.content.details.type !== "album")} />          
        </Col>
        <Col span={1}>
        </Col>
        <Col span={12}>
            <h1>Albums</h1>
            <Table columns={columns} rowKey="id"
              scroll={{ y: 1100 }} 
              pagination={{ pageSize: 500,  position: []}} 
              rowSelection={{type:"checkbox",selectedRowKeys:albumRows,onChange:(rows)=>setAlbumRows(rows)}}
              dataSource={modifiedBookmarks.filter(c=>c.content.details.type === "album")} />          
            </Col>
        </Row>
        <LinkDialog action={linkAction} />
    </>
  )  
}
