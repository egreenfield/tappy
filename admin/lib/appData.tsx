import React, { useState } from "react";
import { CardData, CardDataMap } from "./client/cardActions";


export class AppData  {
    changeCallback: ()=>void;
    AppData() {
        this.changeCallback = undefined;
        this.printQueue = {};
    }
    printQueue:CardDataMap;

    addToPrintQueue(card:CardData) {
        this.printQueue[card.id] = (card);
        this.changeCallback();
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