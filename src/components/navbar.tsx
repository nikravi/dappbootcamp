import React from "react";
import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { MenuAlt1Icon, XIcon } from '@heroicons/react/outline'
import { classNames } from './utils';
import StoreContext from "./contexts/store";
import { connect, disconnect } from "./contexts/interactions"

function Navbar() {
    const [store, dispatchStore] = React.useContext(StoreContext) as any;
    const address = store.w3?.account;
    
    const initiateW3 = async () => {
        await connect(store)
    }

    return (
        <>
            {/* Navbar */}
            <Disclosure as="nav" className="flex-shrink-0 bg-indigo-600">
                {({ open }) => (
                    <>
                        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                            <div className="relative flex items-center justify-between h-16">
                                {/* Logo section */}
                                <div className="flex items-center px-2 lg:px-0 xl:w-64">
                                    <div className="flex-shrink-0">
                                        <img
                                            className="h-8 w-auto"
                                            src="https://tailwindui.com/img/logos/workflow-mark-indigo-300.svg"
                                            alt="Workflow"
                                        />
                                    </div>
                                </div>

                                <div className="flex lg:hidden">
                                    {/* Mobile menu button */}
                                    <Disclosure.Button className="bg-indigo-600 inline-flex items-center justify-center p-2 rounded-md text-indigo-400 hover:text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white">
                                        <span className="sr-only">Open main menu</span>
                                        {open ? (
                                            <XIcon className="block h-6 w-6" aria-hidden="true" />
                                        ) : (
                                            <MenuAlt1Icon className="block h-6 w-6" aria-hidden="true" />
                                        )}
                                    </Disclosure.Button>
                                </div>
                                {/* Links section */}
                                <div className="hidden lg:block lg:w-80">
                                    <div className="flex items-center justify-end">
                                        
                                        {/* Profile dropdown */}

                                        {!store.w3?.active ? (
                                            <div className="flex items-center justify-end">
                                                <div className="flex">
                                                    <a
                                                    href="#"
                                                    onClick={() => initiateW3()}
                                                    className="px-3 py-2 rounded-md text-sm font-medium text-indigo-200 hover:text-white">
                                                        Connect
                                                    </a>
                                                </div>
                                            </div>) : ''}

                                        {store.w3?.active && (
                                        <Menu as="div" className="ml-4 relative flex-shrink-0">
                                            <div>
                                                <Menu.Button className="bg-indigo-700 flex text-sm rounded-full text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white p-2">
                                                    <span className="sr-only">Address</span>
                                                    {address ? address : 'Not connected'}
                                                </Menu.Button>
                                            </div>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-100"
                                                enterFrom="transform opacity-0 scale-95"
                                                enterTo="transform opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="transform opacity-100 scale-100"
                                                leaveTo="transform opacity-0 scale-95"
                                            >
                                                <Menu.Items className="origin-top-right absolute z-10 right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <a
                                                                href={`https://etherscan.io/address/${address}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className={classNames(
                                                                    active ? 'bg-gray-100' : '',
                                                                    'block px-4 py-2 text-sm text-gray-700'
                                                                )}
                                                            >
                                                                View on Etherscan
                                                            </a>
                                                        )}
                                                    </Menu.Item>
    
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <a
                                                                href="#"
                                                                    onClick={() => disconnect(store, dispatchStore)}
                                                                className={classNames(
                                                                    active ? 'bg-gray-100' : '',
                                                                    'block px-4 py-2 text-sm text-gray-700'
                                                                )}
                                                            >
                                                                Logout
                                                            </a>
                                                        )}
                                                    </Menu.Item>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Disclosure.Panel className="lg:hidden">
                            <div className="pt-4 pb-3 border-t border-indigo-800">
                                <div className="px-2">
                                    {store.w3?.active ? (<>
                                    <Disclosure.Button
                                        as="a"
                                        target="_blank"
                                        rel="noreferrer"    
                                        href={`https://etherscan.io/address/${address}`}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:text-indigo-100 hover:bg-indigo-600"
                                    >
                                        Your Profile
                                    </Disclosure.Button><Disclosure.Button
                                        as="a"
                                        href="#"
                                        className="mt-1 block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:text-indigo-100 hover:bg-indigo-600"
                                    >
                                            <div onClick={() => disconnect(store, dispatchStore)}>Sign out</div>
                                        </Disclosure.Button>
                                    </>) : (<Disclosure.Button
                                            as="a"
                                            href="#"
                                        
                                        className="block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:text-indigo-100 hover:bg-indigo-600"
                                    >
                                            <div onClick={() => initiateW3()}>Connect</div>
                                    </Disclosure.Button>)}
                                    
                                </div>
                            </div>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
        </>
    );
}

export default Navbar;

