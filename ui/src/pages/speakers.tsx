import { ColumnsType } from 'antd/lib/table';
import React, { useEffect, useState } from 'react';
import TopTable from '../components/TopTable';
import { useSpeakers } from '../lib/loaders';
import { setActiveSpeakers } from '../lib/speakers';


export default function Speakers() {

  const [selected,setSelected] = useState<string[]>([]);
  const [speakers,setSpeakers] = useState<string[]>([]);

  const {speakerData} = useSpeakers();

  useEffect(()=> {
    if(speakerData) {
      setSpeakers(speakerData.speakers);
      setSelected(speakerData.active);
    }
  },[speakerData])
  const columns: ColumnsType<{name:string}> = [
    {
      title: 'Speaker',
      dataIndex:"name",
    },
  ];
  
    const updateSelection = (sel:React.Key[]) => {
        setSelected(sel as string[]);
        setActiveSpeakers(sel as string[]);
    }

    return (
    <>
      <section>
        <h1>Speakers</h1>
          <TopTable columns={columns} 
            rowSelection={{type:"checkbox",selectedRowKeys:selected, onChange:(rows:React.Key[])=>updateSelection(rows)}}
            rowKey="name"  
            dataSource={speakers.map(v => ({name:v}))} />          
        {}
      </section>
      </>
  )  
}
