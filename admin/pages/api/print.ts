import type { NextApiRequest, NextApiResponse } from 'next'
import PdfPrinter from 'pdfmake';
import { getCurrentCards } from '../../lib/serverCardActions'

var fonts = {
	Roboto: {
		normal: 'fonts/Roboto-Regular.ttf',
		bold: 'fonts/Roboto-Medium.ttf',
		italics: 'fonts/Roboto-Italic.ttf',
		bolditalics: 'fonts/Roboto-MediumItalic.ttf'
	}
};


function mmToPt(mm:number) {
    return mm*2.83465
}

async function  getDoc() {

    const response = await fetch('https://i.scdn.co/image/ab67706f00000003a2dba0d1f56bc9bdb28b5204');
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const b64 = "data:image/jpeg;base64," + buffer.toString("base64url")
    console.log("url is",b64);

    var docDefinition = {
        pageSize: 'LETTER',
        pageMargins: [ 72/4, 72/4, 72/4, 72/4 ],
        content: [
            {
                svg: 
                `<svg>
                    <rect width="54mm" stroke="black" stroke-width="1" fill-opacity="0" height="85mm" rx="2mm" ry="2mm"/>
                </svg>`,
                absolutePosition: { x: 10, y: 10 }
            },
            { 
                image: 'img1',
                width: mmToPt(54),
                height: mmToPt(54),
                absolutePosition: { x: 10, y: 10 }
            },
            {
                text: 'This is a long title that is part of a text block This is a long title that is part of a text block',
                absolutePosition: { x: 10, y: mmToPt(54) },
                width: mmToPt(54),
                height: mmToPt(85-54),
            },
        ],
        images: {
            img1: b64,
        },
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10]
            },
            subheader: {
                fontSize: 16,
                bold: true,
                margin: [0, 10, 0, 5]
            },
            tableExample: {
                margin: [0, 5, 0, 15]
            },
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
            }
        },
    };
    return docDefinition;
}

async function generatePDF(definition:any) {
    
    
    var printer = new PdfPrinter(fonts);
    var doc = printer.createPdfKitDocument(await getDoc() as any);
    return doc;
}

  
export default async function handler(req:NextApiRequest, res:NextApiResponse) {

    if (req.method != "GET") {
        res.status(500)
        return;
    }

    let currentCards = await getCurrentCards();
    let idsToPrint = (req.query["ids"] as string).split(",") 
    let idsToPrintMap = {}
    for (let anID of idsToPrint) {
        idsToPrintMap[anID] = true;
    }
    let cardsToPrint = currentCards.filter(card => card.id in idsToPrintMap)

    let pdf;
    try {
        let pdf = await generatePDF(cardsToPrint);
        res.status(200)
        res.setHeader("Content-Type",'application/pdf');
        pdf.pipe(res);
        pdf.end();
    } catch(e) {
        console.log("error generating pdf:",e);
        res.status(500).json({error:"pdf generation failed"})
    }
}