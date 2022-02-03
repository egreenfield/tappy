import { Table } from "antd";



export default function TopTable({columns,dataSource}) {
    return (
        <Table columns={columns}           
        pagination={{ position: ["topRight", "bottomRight"] }} 
        dataSource={dataSource} 
        style={{margin: "-50px 0px 50px"}} />          
    )
}