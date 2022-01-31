import React, { useState } from "react";

type ReaderCallback = (cardID:string)=>void; 
export class AppData  {
    changeCallback: ()=>void;
    readerCallback: ReaderCallback;
    readerTimeout = 20000;
    readerTimer:NodeJS.Timeout;
    AppData() {
        this.changeCallback = undefined;
    }

    setReaderCallback(callback:ReaderCallback) {
        this.readerCallback = callback;
        let that = this;
        this.readerTimer = setTimeout(()=>{that.clearReaderCallback()},this.readerTimeout)
        this.changeCallback();
    }

    clearReaderCallback() {
        clearTimeout(this.readerTimer);
    }

    loadConfigData() {

    }
    saveConfigData() {
        
    }
}

export const appData = new AppData();

export const AppDataContext = React.createContext({appData});

export const AppDataProvider = ({children}) => {
    const [_appData,setAppData] = useState(appData);
    appData.changeCallback = ()=> {setAppData(appData)};
    return (
        <AppDataContext.Provider value={{appData:_appData}}>
            {children}
        </AppDataContext.Provider>
    )

}