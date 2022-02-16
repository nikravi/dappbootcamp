import React from "react";
import { Fragment } from 'react'
import { classNames } from "./utils";

function Trades({orders}) {

    console.log(orders);
    
    return (<>
        <div className="h-full relative" style={{ minHeight: '16rem' }}>
            <div className="absolute inset-0 border-2 border-gray-200 rounded-lg" >
                <h3 className="text-lg leading-6 font-medium text-gray-900 p-4">Trades</h3>
                <div className="flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Time
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                DAPP
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                DAPP/ETH
                                            </th>
                                            
                                            {/* <th scope="col" className="relative px-6 py-3">
                                                <span className="sr-only">Edit</span>
                                            </th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order, orderIndex) => (
                                            <tr key={order.id.toString()} className={classNames(
                                                orderIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                                                <td className={classNames(
                                                    'px-6 py-4 whitespace-nowrap text-sm font-medium',
                                                    order.isPriceHigher ? 'text-green-500' : 'text-red-500'
                                                )}>{order.formattedTimestamp}</td>
                                                <td className={classNames('px-6 py-4 whitespace-nowrap text-sm ',
                                                    order.isPriceHigher ? 'text-green-500' : 'text-red-500')}>{order.tokenAmount}</td>
                                                <td className={classNames("px-6 py-4 whitespace-nowrap text-sm ",
                                                    order.isPriceHigher ? 'text-green-500' : 'text-red-500')}>{order.etherAmount}</td>
                                                {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <a href="#" className="text-indigo-600 hover:text-indigo-900">
                                                        Edit
                                                    </a>
                                                </td> */}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>)
}

export default Trades;