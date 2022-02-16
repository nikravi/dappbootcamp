import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { Web3ReactContextInterface } from "@web3-react/core/dist/types";
import { ethers } from "ethers";
import React from "react";
import StoreContext from "./store";

export interface Store {
    hasMetamask?: boolean;
    w3?: Web3ReactContextInterface<Web3Provider>;
    token?: ethers.Contract;
    exchange?: ethers.Contract;
}

export interface Action {
    type: 'init' | 'updateToken' | 'updateExchange' | 'removeContracts';
    w3?: Web3ReactContextInterface<Web3Provider>;
    token?: ethers.Contract;
    exchange?: ethers.Contract;
}

const dataFetchReducer = (store: Store, action: Action): Store => {    
    switch (action.type) {
        case 'init': {
            const hasMetamask = typeof window.ethereum !== "undefined";
            return { ...store, hasMetamask, w3: action.w3 }
        }
        case 'updateToken': {
            return { ...store, token: action.token }
        }
        case 'updateExchange': {
            return { ...store, exchange: action.exchange }
        }
        case 'removeContracts': {
            return { ...store, token: undefined, exchange: undefined }
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
    }
}

function StoreProvider (props: any) {
    const [store, dispatchStore] = React.useReducer(dataFetchReducer, {
        hasMetamask: false,
    });
    const w3 = useWeb3React();

    React.useEffect(() => {
        dispatchStore({
            type: 'init',
            w3
        });
    }, [w3])
    
    const value = [store, dispatchStore];
    return <StoreContext.Provider value={value} {...props} />;
}

export default StoreProvider;

