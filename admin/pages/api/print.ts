import type { NextApiRequest, NextApiResponse } from 'next'
import PdfPrinter from 'pdfmake';
import { getCurrentCards } from '../../lib/serverCardActions'
import PDFDocument from 'pdfkit';
import { CardData } from '../../lib/cardActions';


const mmToPt = (mm:number) => mm*2.83465;
const cardWidth = mmToPt(54.5);
const cardHeight = mmToPt(85.8);
const textMargin = mmToPt(2);
const cornerRadius = mmToPt(3);
const pageWidth = mmToPt(215.9);
const pageHeight = mmToPt(279.4);
const hMargin = mmToPt(10);
const vMargin = mmToPt(5);


async function loadImageUrlIntoBuffer(url:string) {

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
}


async function drawFrontOfCard( pdf:PDFKit.PDFDocument, card:CardData, left:number,top:number)  {

    pdf
    .lineWidth(.5)
    .save()
    .roundedRect(left,top,cardWidth,cardHeight,cornerRadius)
    .clip()
    .image(await loadImageUrlIntoBuffer(card.content.cover),left,top,{width:cardWidth})
    .restore()
    .roundedRect(left,top,cardWidth,cardHeight,mmToPt(2))
    .stroke([0xAA,0xAA,0xAA])
    .moveTo(left,top+cardWidth)
    .lineTo(left+cardWidth,top+cardWidth)
    .stroke([0xDD,0xDD,0xDD])

    .text(card.content.title,left+textMargin,top+cardWidth+textMargin,{ width:cardWidth-2*textMargin})
    ;
    return {right:left + cardWidth,bottom:top+cardHeight}
}

async function generatePDF(cardsToPrint:CardData[]) {
    
    let pdf = new PDFDocument();
    let left = hMargin;
    let top = vMargin;
    let bottom = top;
    let right = left;

    for(let aCard of cardsToPrint) {
        if(left+cardWidth > pageWidth-2*hMargin) {
            left = hMargin;
            top = bottom + vMargin;
        }
        if(top+cardHeight > pageHeight) {
            top = vMargin;
            pdf.addPage();
        }
        ({bottom, right} = await drawFrontOfCard(pdf,aCard,left,top));
        left = right + hMargin;

    }
    return pdf;
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
        let pdf = await generatePDF(cardsToPrint)
        res.status(200)
        res.setHeader("Content-Type",'application/pdf');
        pdf.pipe(res);
        pdf.end();
    } catch(e) {
        console.log("error generating pdf:",e);
        res.status(500).json({error:"pdf generation failed"})
    }
}