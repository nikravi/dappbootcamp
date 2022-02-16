import React, { useEffect, useState } from "react";
import { loadCancelledOrders, loadCommonOrders, loadTradedOrders } from './contexts/interactions'
import StoreContext from "./contexts/store";
import Trades from "./trades";


export interface EventFilter {
    address?: string
    topics?: Array<string | Array<string> | null>
}

function Content() {
    const [store] = React.useContext(StoreContext) as any;

    const [cancelledOrders, setCancelledOrders] = useState([]);
    const [tradedOrders, setTradedOrders] = useState([]);
    const [commonOrders, setCommonOrders] = useState([]);
    useEffect(() => {
        const loadOrders = async () => {
            setCancelledOrders(await loadCancelledOrders(store));
            setTradedOrders(await loadTradedOrders(store));
            setCommonOrders(await loadCommonOrders(store));
        }
        loadOrders()
    }, [store])
   
    return <>

        {/* 3 column wrapper */}
        <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
            {/* Left sidebar & main wrapper */}
            <div className="flex-1 min-w-0 bg-white xl:flex">
                <div className="border-b border-gray-200 xl:border-b-0 xl:flex-shrink-0 xl:w-64 xl:border-r xl:border-gray-200 bg-white">
                    <div className="h-full pl-4 pr-6 py-6 sm:pl-6 lg:pl-8 xl:pl-0">
                        {/* Start left column area */}
                        <div className="h-full relative" style={{ minHeight: '12rem' }}>
                            <div className="absolute inset-0 border-2 border-gray-200 border-dashed rounded-lg" />
                        </div>
                        {/* End left column area */}
                    </div>
                </div>

                <div className="bg-white lg:min-w-0 lg:flex-1">
                    <div className="h-full py-6 px-4 sm:px-6 lg:px-8">
                        {/* Start main area*/}
                        <div className="relative h-full" style={{ minHeight: '36rem' }}>
                            <div className="absolute inset-0 border-2 border-gray-200 border-dashed rounded-lg" />
                        </div>
                        {/* End main area */}
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 pr-4 sm:pr-6 lg:pr-8 lg:flex-shrink-0 lg:border-l lg:border-gray-200 xl:pr-0">
                <div className="h-full pl-6 py-6 lg:w-80">
                    {/* Start right column area */}
                    <Trades orders={tradedOrders}/>
                    
                    {/* End right column area */}
                </div>
            </div>
        </div>
    </>
}

export default Content;

