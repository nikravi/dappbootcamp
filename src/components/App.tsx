import React from "react";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import ExchangeHome from "./exchange-home";
const getLibrary = (provider) => {
  return new Web3Provider(provider);
};

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ExchangeHome />
    </Web3ReactProvider>
  )
}

export default App;

