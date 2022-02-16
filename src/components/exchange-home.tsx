import React from "react";
import { useEffect, useState } from "react";
import { Fragment } from 'react'
import { Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/solid'
import Navbar from './navbar';
import Content from "./content";
import StoreContext from "./contexts/store";
import { loadExchange, loadToken } from "./contexts/interactions"

function ExchangeHome() {
    const [title] = useState("BarterEX");
    useEffect(() => {
        // This will run when the page first loads and whenever the title changes
        document.title = title;
    }, [title]);

    const [store, dispatchStore] = React.useContext(StoreContext) as any;
    const contractsLoaded = !!store.token && !!store.exchange;

    const [contractsNotExistent, setContractsNotExistent] = useState(false);
    React.useEffect(() => {
        Promise.all([loadToken(store.w3, dispatchStore),
                loadExchange(store.w3, dispatchStore)])
        .then(([token, exchange]) => {
            if (store.w3?.active && (!token || !exchange)) {
                setContractsNotExistent(true);
            }
        })
    }, [store.w3?.active, dispatchStore, store.w3])

    const [show, setShow] = useState(true)

    return (
        <>
            <div className="fixed top-0 left-0 w-1/2 h-full bg-white" aria-hidden="true" />
            <div className="fixed top-0 right-0 w-1/2 h-full bg-gray-50" aria-hidden="true" />
            <div className="relative min-h-screen flex flex-col">
                <Navbar />
                {contractsLoaded ? <Content /> : null }
                {contractsNotExistent ? <>
                    <div
                        aria-live="assertive"
                        className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
                    >
                        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                            {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
                            <Transition
                                show={show}
                                as={Fragment}
                                enter="transform ease-out duration-300 transition"
                                enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                                enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
                                    <div className="p-4">
                                        <div className="flex items-center">
                                            <div className="w-0 flex-1 flex justify-between">
                                                <p className="w-0 flex-1 text-sm font-medium text-gray-900">Contracts not deployed on this network, please select another network with Metamask</p>

                                            </div>
                                            <div className="ml-4 flex-shrink-0 flex">
                                                <button
                                                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    onClick={() => {
                                                        setShow(false)
                                                    }}
                                                >
                                                    <span className="sr-only">Close</span>
                                                    <XIcon className="h-5 w-5" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Transition>
                        </div>
                    </div></> : null}
            </div>
        </>
    );
}

export default ExchangeHome;