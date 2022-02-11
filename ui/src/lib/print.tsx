

export async function sendCardPrintJob(cardIDs:string[],type:string) {
    let idString = cardIDs.join(",");
    window.open("/api/print?ids="+idString+"&type="+type,"_blank");
}