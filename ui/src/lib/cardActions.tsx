import { refreshCards } from "./loaders";
import { CardData, Content } from "./tappyDataTypes";

//----------------------------------------------------------------------------------------------------
// Types
//----------------------------------------------------------------------------------------------------

export interface CardAction {
    complete:boolean;
    cancelled:boolean;
    tapCount:number;
    tappedCard?:CardData;

    promise?:Promise<CardAction>;
    timeoutID?:NodeJS.Timeout;
    checkID?:NodeJS.Timer;
    resolve?:(a:CardAction)=>void,
    reject?:(a:CardAction)=>void
}

//----------------------------------------------------------------------------------------------------
// Helpers
//----------------------------------------------------------------------------------------------------

async function handleTimeout(action:CardAction) {
    completeAction(action,true);
}

async function checkForTap(action:CardAction) {
    let response = await fetch("http://10.0.0.99:8000/api/card/last",{
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    let newTapData = await response.json()
    if (newTapData.count > action.tapCount) {
      completeAction(action,false,newTapData);
    }
  }    

function completeAction(action:CardAction,canceled:boolean,newCardData:CardData|undefined = undefined) {

    action.complete = true;
    action.tappedCard = newCardData;
    action.cancelled = canceled;
    if(action.timeoutID != undefined) {
        clearTimeout(action.timeoutID);
    }
    if(action.checkID != undefined) {
        clearInterval(action.checkID);
    }      
    if(canceled) {
        fetch("http://10.0.0.99:8000/api/card/link",{
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body:JSON.stringify({
                type:"cancel"
            })
        })        
    }

    refreshCards();

    if(canceled) {
        action.reject!(action);
    } else {
        action.resolve!(action);
    }
}

export function cancelCardAction(action:CardAction) {
    if(action.complete == false)
        completeAction(action,true);
}



export async function unlinkCard(card:CardData) {
    return fetch("http://10.0.0.99:8000/api/card/"+card.id,{
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "DELETE",
    })    
}
export function linkCardToContent(contentInfo:Content):CardAction {
    return startCardAction("linkToContent",contentInfo)
}

export function identifyCardContent():CardAction {
    return startCardAction("identifyCardContent")
}

export function startCardAction(type:string,content:any = {},timeout:number|undefined=undefined):CardAction {

    let action:CardAction = {
        tapCount:0,
        complete:false,
        cancelled:false 
    };

    let body = JSON.stringify({
        type,
        content,
        timeout
    });


    const execute = async (resolve:(a:CardAction)=>void,reject:(a:CardAction)=>void) => {
        let response = await fetch("http://10.0.0.99:8000/api/card/link",{
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body
          })  
          
        let responseData = await response.json()    
        action.tapCount = responseData.count;      
        action.timeoutID = setTimeout(()=>{handleTimeout(action)},30000);
        action.checkID = setInterval(() => {checkForTap(action)},1000);
        action.reject = reject;
        action.resolve = resolve;
    }

    action.promise = new Promise(execute);

    return action;
}



export async function sendCardPrintJob(cardIDs:string[],type:string) {
    let idString = cardIDs.join(",");
    window.open("/api/print?ids="+idString+"&type="+type,"_blank");
}