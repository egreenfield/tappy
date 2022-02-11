
import { Modal } from 'antd';
import PDFDocument from 'pdfkit';
import { CardData } from './tappyDataTypes';


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

interface CardBounds {
    left:number;
    top:number;
    right:number;
    bottom:number;
}

interface pdfGenerationData {
    pdf:PDFKit.PDFDocument;
    left:number;
    top:number;
    page:number;
    nextCard:number;
    cardsToPrint:CardData[];
}


async function drawBacksOfCards( pdf:PDFKit.PDFDocument, backs:CardBounds[]) {

    for (let aBack of backs) {
        let left = pageWidth-aBack.right;

        pdf
        .roundedRect(left,aBack.top,cardWidth,cardHeight,cornerRadius)
        .stroke([0xAA,0xAA,0xAA])
        ;
    }

}
async function drawFrontOfCard( pdf:PDFKit.PDFDocument, card:CardData, left:number,top:number)  {


    let titleHeight = pdf
    .save()
    .font('fonts/TitleFont.ttf')
    .fontSize(14)
    .heightOfString(card.content.title,{ width:cardWidth-3*textMargin-left, lineGap: 1, paragraphGap:1})

    pdf.restore()
    pdf
    .lineWidth(.5)
    .save()
    .roundedRect(left,top,cardWidth,cardHeight,cornerRadius)
    .clip()
    .image(await loadImageUrlIntoBuffer(card.content.cover),left,top,{width:cardWidth})
    .restore()
    .save()
    .moveTo(left,top+cardWidth)
    .lineTo(left+cardWidth,top+cardWidth)
    .stroke([0xDD,0xDD,0xDD])
    .restore()
    .font('fonts/TitleFont.ttf')
    .fontSize(14)
    .fillColor([0x5a,0x59,0x59])
    .text(card.content.title,left+2*textMargin,top+cardWidth+textMargin,{ width:cardWidth-3*textMargin-left, lineGap: 1, paragraphGap:1})
    .moveDown()
    .font('fonts/BodyFont.ttf')
    .fontSize(10)
    .text(card.content.details.artist,left+2*textMargin,top+cardWidth+textMargin+titleHeight,{ width:cardWidth-3*textMargin-left, lineGap: 1, paragraphGap:1})
    .image('content/brand.png',left + cardWidth-mmToPt(8),top + cardHeight - mmToPt(8),{width:mmToPt(5)})
    ;
        
    pdf
    .roundedRect(left,top,cardWidth,cardHeight,cornerRadius)
    .stroke([0xDD,0xDD,0xDD])
    ;

    return {right:left + cardWidth,bottom:top+cardHeight}
}



async function generateOnePage(data:pdfGenerationData) {
    let {pdf,left,top,cardsToPrint,nextCard} = data;
    let bottom = data.top;
    let right = data.left;
    let moreToPrint = false;
    let backs:CardBounds[] = [];

    for(;nextCard<data.cardsToPrint.length;nextCard++) {
        
        let aCard = cardsToPrint[nextCard];
        if(left+cardWidth > pageWidth-2*hMargin) {
            left = hMargin;
            top = bottom + vMargin;
        }
        if(top+cardHeight >= pageHeight-2*vMargin) {
            top = vMargin;
            moreToPrint = true;
            break;
            pdf.addPage();
        }
        ({bottom, right} = await drawFrontOfCard(pdf,aCard,left,top));
        backs.push({left,top,right,bottom});
        left = right + hMargin;
    }

    pdf.addPage()
    await drawBacksOfCards(pdf,backs);
    Object.assign(data,{left,top,nextCard});
    return moreToPrint;
}


async function generatePDF(cardsToPrint:CardData[]) {
    let data:pdfGenerationData = {
        pdf: new PDFDocument(),
        left: hMargin,
        page:0,
        top: vMargin,
        nextCard:0,
        cardsToPrint
    }    
    while(data.nextCard < data.cardsToPrint.length) {
        let moreToPrint = await generateOnePage(data);
        if (moreToPrint) {
            data.pdf.addPage();
        }
    }
    return data.pdf;
}

  


export async function sendCardPrintJob(cardsToPrint:CardData[],type:string) {

    try {
        let {destroy} = Modal.info({
            content: "hello, world",
            onOk: ()=> {destroy()}
        })
        let pdf = await generatePDF(cardsToPrint)
    } catch(e) {
    }

}