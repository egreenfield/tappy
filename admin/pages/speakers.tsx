import Layout from '../components/layout'
import { getSession, useSession, signIn, signOut } from "next-auth/react"
import {getUsersPlaylists} from '../lib/spotify';
import { Table, Space, Button, Modal, Tooltip, Popconfirm, message, Row, Col } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';
import { CardData, identifyCardContent, sendCardPrintJob, unlinkCard } from '../lib/cardActions';
import LinkDialog from '../components/LinkDialog';
import Link from 'next/link';
import { TiDelete} from 'react-icons/ti';
import { BsQuestionSquare} from 'react-icons/bs';
import { AiFillQuestionCircle } from 'react-icons/ai';
import { BsPrinter } from 'react-icons/bs';

import { IconContext } from 'react-icons/lib';
import TopTable from '../components/TopTable';
import CardInfoDialog from '../components/CardInfoDialog';
import { getCurrentCards } from '../lib/serverCardActions';
import { getSpeakers } from '../lib/serverSpeaker';
import { setActiveSpeakers } from '../lib/speaker';


// This gets called on every request
export async function getServerSideProps(ctx) {
  let speakers = await getSpeakers();
  return { props: speakers }
}

interface SpeakersProps {
  speakers:string[];
  active:string[];
}
export default function Speakers({speakers,active}:SpeakersProps) {

    const [selected,setSelected] = useState(active);

  const columns: ColumnsType<CardData> = [
    {
      title: 'Speaker',
      dataIndex:"name",
    },
  ];
  
    const updateSelection = (sel) => {
        setSelected(sel);
        setActiveSpeakers(sel);
    }

    return (
    <>
      <section>
        <h1>Speakers</h1>
          <TopTable columns={columns} 
            rowSelection={{type:"checkbox",selectedRowKeys:selected, onChange:(rows)=>updateSelection(rows)}}
            rowKey="name"  
            dataSource={speakers.map(v => ({name:v}))} />          
        {}
      </section>
      </>
  )  
}

Speakers.getLayout = function getLayout(page) {
  return (
    <Layout selected='speakers' key={""}>{page}</Layout>
  )
}
