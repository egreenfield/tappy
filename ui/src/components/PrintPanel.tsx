import { Col, Row, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { cancelCardAction, CardAction } from '../lib/cardActions';
import { generatePDFUrl } from '../lib/print';
import { CardData } from '../lib/tappyDataTypes';


interface PrintPanelProps {
    active:boolean;
    cardsToPrint:CardData[]|undefined;
}

export default function PrintPanel({active,cardsToPrint}:PrintPanelProps) {
    let [pdfUrl,setPdfUrl] = useState<string|undefined>(undefined);

    useEffect(() => {
        setPdfUrl(undefined);
        if (active && cardsToPrint && cardsToPrint.length) {
            let pdfPromise = generatePDFUrl(cardsToPrint);
            let showPDF = true;
            pdfPromise.then((newUrl) => {
                setPdfUrl(newUrl);
            });
            return ()=> {showPDF = false};
        }
    },[active,cardsToPrint])

    if(!active) {
        return (
            <></>
        )
    }
    return (
        <Row style={{minHeight:"800px", borderStyle:"solid", borderWidth:1,borderColor:"#ddd",margin:"50px"}} align="middle">
            <Col span={24}>
                {
                    (!pdfUrl)?( 
                        <Spin size="large" />
                    ):
                    (
                        <iframe width="100%" height="800px" src={pdfUrl}></iframe>                        
                    )
                }
            </Col> 
        </Row>
    )
    
}