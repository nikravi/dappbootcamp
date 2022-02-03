import Web3 from "web3";

export const ether = (n: string | number) => {
  return Web3.utils.toBN(Web3.utils.toWei(n.toString(), 'ether'));
}

export const tokens = (n: string | number) => ether(n)
  


export const EVM_REVERT = 'VM Exception while processing transaction: revert';

export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';