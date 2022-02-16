import { Store } from './store-provider'
import { InjectedConnector } from "@web3-react/injected-connector";
import Token from '../../abis/Token.json'
import Exchange from '../../abis/Exchange.json'
import { ethers } from "ethers";
import { Web3ReactContextInterface } from "@web3-react/core/dist/types";
import { Web3Provider } from "@ethersproject/providers";
import { Event } from "@ethersproject/contracts"
import { formatUnits } from 'ethers/lib/utils';
import { ETHER_ADDRESS } from '../utils';
import { format, fromUnixTime } from 'date-fns';
import { BEXOrder } from './models';

export const injected = new InjectedConnector({});


export async function connect(store: Store) {
    await store.w3?.activate(injected);
}

export async function disconnect(store: Store, dispatchStore: any) {
    await store.w3?.deactivate();
    dispatchStore({
        type: 'removeContracts'
    })
}

export async function loadToken(w3: Web3ReactContextInterface<Web3Provider>, dispatchStore: any) {
    if (!w3?.chainId) {
        return null;
    }
    const signer = w3?.library?.getSigner();
    try {
        const contractAddress = ((Token.networks as any)[w3?.chainId] as any).address;
        const token = new ethers.Contract(contractAddress, Token.abi, signer);

        dispatchStore({
            type: 'updateToken',
            token
        })
        return token;
    } catch (error) {
        console.error(error)
        return null;
    }
    
}

export async function loadExchange(w3: Web3ReactContextInterface<Web3Provider>, dispatchStore: any) {
    if (!w3?.chainId) {
        return null;
    }
    const signer = w3?.library?.getSigner();
    try {
        const contractAddress = ((Exchange.networks as any)[w3?.chainId] as any).address;
        const exchange = new ethers.Contract(contractAddress, Exchange.abi, signer);

        dispatchStore({
            type: 'updateExchange',
            exchange
        })
        return exchange;
    } catch (error) {
        console.error(error)
    }
    
}


const decorateOrder = (order: Event["args"]): BEXOrder => {
    const isBuyOrder = order?.tokenGive === ETHER_ADDRESS
    let tokenAmount, etherAmount;
    debugger
    if (isBuyOrder) {
        etherAmount = order?.amountGive;
        tokenAmount = order?.amountGet;
    } else {
        etherAmount = order?.amountGet;
        tokenAmount = order?.amountGive;
    }
    let tokenPrice = (etherAmount / tokenAmount)
    const precision = 100000
    tokenPrice = Math.round(tokenPrice * precision) / precision
    const dateTime = fromUnixTime(order?.timestamp);
    let bexOrder = {
        ...order,
        isBuyOrder,
        etherAmount: formatUnits(etherAmount),
        tokenAmount: formatUnits(tokenAmount),
        tokenPrice,
        formattedTimestamp: format(dateTime, "h:mm:ss a M/d") 
    } as BEXOrder;

    return bexOrder;
}

const decorateFilledOrder = (order: BEXOrder, previousOrder: BEXOrder): BEXOrder => {
    let isPriceHigher = (previousOrder?.tokenPrice || 0 ) <= order.tokenPrice;

    console.log(previousOrder?.tokenPrice, order.tokenPrice, isPriceHigher);
    

    return {...order,
        isPriceHigher
    };
}

async function loadEventsByName(exchange: ethers.Contract, filterName: string, includePriceFluctuation = false) {
    const ordersFilter = exchange.filters[filterName]();
    const events = await exchange?.queryFilter(ordersFilter);
    let previousOrder: BEXOrder = {} as BEXOrder;

    const eventArgs = events.map((event) => event.args)
        .sort((a, b) => {
            return a?.timestamp.sub(b?.timestamp).toNumber()
        })
        .map(o => {
            let order = decorateOrder(o);
            if (includePriceFluctuation) {
                order = decorateFilledOrder(order, previousOrder);
                previousOrder = order;
            }
            return order;
        })    
        .sort((a, b) => {
            return b?.timestamp.sub(a?.timestamp).toNumber()
        })
        
    return eventArgs;
}

export async function loadCancelledOrders(store: Store) {
    if (!store.exchange) {
        return null;
    }

    return loadEventsByName(store.exchange, 'Order');
}

export async function loadTradedOrders(store: Store) {
    if (!store.exchange) {
        return null;
    }

    return loadEventsByName(store.exchange, 'Trade', true);
}


export async function loadCommonOrders(store: Store) {
    if (!store.exchange) {
        return null;
    }

    return loadEventsByName(store.exchange, 'Order');
}

export {}