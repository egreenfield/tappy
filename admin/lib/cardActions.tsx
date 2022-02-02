
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


