import { Table } from "antd";



interface TopTableProps {
    dataSource:any[]
    columns:any
    rowSelection?:any
    rowKey:string
}
export default function TopTable({columns,dataSource,rowSelection,rowKey}:TopTableProps) {
    return (
        <Table columns={columns}           
        rowSelection={rowSelection}
        rowKey={rowKey}
        pagination={{ position: ["topRight", "bottomRight"] }} 
        dataSource={dataSource} 
        style={{margin: "-50px 0px 50px"}} />          
    )
}