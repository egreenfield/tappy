
export interface LinkAction {
    complete:boolean;
    cancelled:boolean;
    tapCount:number;
    promise?:Promise<LinkAction>;
    timeoutID?:NodeJS.Timeout;
    checkID?:NodeJS.Timer;
    resolve?:(a:LinkAction)=>void,
    reject?:(a:LinkAction)=>void
}

export interface LinkActionRequest {
    url:string;
    cover:string;
    title:string;
    details:any;
}

export interface CardData {
    id:string;
    url:string;
    cover:string;
    title:string;
    details: {
        printed:string;
        type:string;
    }
}

//----------------------------------------------------------------
// Client Side

const handleTimeout = async (action:LinkAction) => {
    completeAction(action,true);
}

const checkForTap = async (action:LinkAction) => {
    let response = await fetch('/api/card/last');
    let newTapData = await response.json()
    if (newTapData.count > action.tapCount) {
      completeAction(action,false);
    }
  }    

export function cancelLinkAction(action:LinkAction) {
    if(action.complete == false)
        completeAction(action,true);
}

const completeAction = (action:LinkAction,canceled:boolean) => {

    action.complete = true;
    action.cancelled = canceled;
    if(action.timeoutID != undefined) {
        clearTimeout(action.timeoutID);
    }
    if(action.checkID != undefined) {
        clearInterval(action.checkID);
    }      

    if(canceled) {
        fetch('/api/card/link',{
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body:"{}"
          })        
    }
    if(canceled) {
        action.reject(action);
    } else {
        action.resolve(action);
    }
}

export async function unlinkCard(card:CardData) {
    return fetch('/api/card/'+card.id,{
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "DELETE",
    })    
}

export function startLinkAction(request:LinkActionRequest):LinkAction {

    let action:LinkAction = {
        tapCount:0,
        complete:false,
        cancelled:false        
    };

    let body = JSON.stringify({
        url:request.url,
        cover:request.cover,
        title:request.title,
        details: request.details
    });


    const execute = async (resolve:(a:LinkAction)=>void,reject:(a:LinkAction)=>void) => {
        let response = await fetch('/api/card/link',{
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

//----------------------------------------------------------------
// Server Side

export async function getCurrentCards():Promise<CardData[]> {
        let response = await fetch('http://10.0.0.99:8000/api/card',{
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "GET"
            });
        let cardMap = await response.json();
        return Object.keys(cardMap).map<CardData>(id => ({id, ...cardMap[id]}))
}