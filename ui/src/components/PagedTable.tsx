import { Pagination, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { useState } from "react";
import { usePage } from "../lib/loaders";
import { PagedList } from "../lib/musicDataTypes";


interface PagedTableProps<ItemType> {
    pagedList:PagedList<ItemType>|undefined;
    columns:ColumnsType<ItemType>;
    rowKey:string;
}
export function PagedTable<ItemType>({pagedList,columns,rowKey}:PagedTableProps<ItemType>) {


    const [pageSize,setPageSize] = useState<number>(40);
    const [page,setPage] = useState<number>(1);
    const {items} = usePage<ItemType>(pagedList,page-1,pageSize);

    function onPaginatorChange(pageNumber:number,pageSize:number) {
        setPage(pageNumber);
        setPageSize(pageSize);
    }

    return (
    <>
        <Pagination current={page} defaultPageSize={pageSize} defaultCurrent={1} total={pagedList?.total}
            onChange={onPaginatorChange} showLessItems={true} style={{marginBottom:20}}/>
        <Table columns={columns} dataSource={items?items as any[]:[]} rowKey={rowKey} pagination={false}/>
        <Pagination current={page} defaultPageSize={pageSize} defaultCurrent={1} total={pagedList?.total}
            onChange={onPaginatorChange} showLessItems={true} style={{marginTop:20}}/>
    </>
    )

}