
import { Modal } from 'antd';
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

const TITLE_FONT_URL = "/static/assets/fonts/TitleFont.ttf";
const TITLE_FONT_NAME = "titleFont";
const BODY_FONT_URL = "/static/assets/fonts/BodyFont.ttf";
const BODY_FONT_NAME = "bodyFont";
const BRAND_URL = "/static/assets/brand.png"

let titleFont:ArrayBuffer|undefined = undefined;
let bodyFont:ArrayBuffer|undefined = undefined;
let fontsLoaded:boolean = false;

async function loadFonts() {
    let titleFontP = fetch(TITLE_FONT_URL)
    .then(response => response.arrayBuffer())
    let bodyFontP =  fetch(BODY_FONT_URL)
    .then(response => response.arrayBuffer())

    let data = await Promise.all([titleFontP,bodyFontP]);
    titleFont = data[0];
    bodyFont = data[1];
}
async function loadImageUrlIntoBuffer(url:string) {

    return new Promise((resolve,reject) => {
        var image = new Image();
        image.crossOrigin='Anonymous';

        image.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth; // or 'width' if you want a special/scaled size
            canvas.height = image.naturalHeight; // or 'height' if you want a special/scaled size
    
            canvas.getContext('2d')?.drawImage(image, 0, 0);
            let pngUrl = canvas.toDataURL('image/png');
            resolve(pngUrl);
        };
    
        image.src = url;    
    })
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


    let titleHeight = 
     pdf
    .save()
    .font(TITLE_FONT_NAME)
    .fontSize(14)
    .heightOfString(card.content.title,{ width:cardWidth-3*textMargin, lineGap: 1, paragraphGap:1})


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
    .font(TITLE_FONT_NAME)
    .fontSize(14)
    .fillColor([0x5a,0x59,0x59])
    .text(card.content.title,left+2*textMargin,top+cardWidth+textMargin,{ width:cardWidth-3*textMargin, lineGap: 1, paragraphGap:1})
    .moveDown()
    .font(BODY_FONT_NAME)
    .fontSize(10)
    .text(card.content.details.artist,left+2*textMargin,top+cardWidth+textMargin+titleHeight,{ width:cardWidth-3*textMargin, lineGap: 1, paragraphGap:1})
    .image(await loadImageUrlIntoBuffer(BRAND_URL),left + cardWidth-mmToPt(8),top + cardHeight - mmToPt(8),{width:mmToPt(5)})
    ;
        
    pdf
    .roundedRect(left,top,cardWidth,cardHeight,cornerRadius)
    .stroke([0xF8,0xF8,0xF8])
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



async function generatePDF(cardsToPrint:CardData[],pdf:PDFKit.PDFDocument|undefined = undefined) {
    let g:any = window;

    if(pdf == undefined)
        pdf = new g.PDFDocument();

    let data:pdfGenerationData = {
        pdf: pdf? pdf:new g.PDFDocument(),
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

  
export async function generatePDFUrl(cardsToPrint:CardData[]):Promise<string> {

    if(fontsLoaded == false) {
        await loadFonts();
    }

    return new Promise((resolve,reject) => {
        let g:any = window;
        let blobStream = g.blobStream;
        let pdf:PDFKit.PDFDocument = new g.PDFDocument();
        pdf.registerFont(TITLE_FONT_NAME,titleFont!)
        pdf.registerFont(BODY_FONT_NAME,bodyFont!)
        
        generatePDF(cardsToPrint,pdf).then(pdf => {
            let stream = blobStream();
            pdf.pipe(stream);
            stream.on('finish', function() {              
                const url = stream.toBlobURL('application/pdf');
                resolve(url);
            });       
            pdf.on('data',function() {"DATA SENT" })   
            pdf.on('finish',function() {"PDF FINISHED" })   
            pdf.on('error',function() {"PDF ERROR" })   
            pdf.end();
        })    
    });
}
