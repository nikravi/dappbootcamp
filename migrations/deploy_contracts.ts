import Web3 from "web3";

type Network = "development" | "kovan" | "mainnet";

module.exports = (
    artifacts: Truffle.Artifacts, web3: Web3
    ) => {
  return async (
    deployer: Truffle.Deployer,
    network: Network,
    accounts: string[]
  ) => {
    const Token = artifacts.require("Token");

    await deployer.deploy(Token);
    // await deployer.link(ConvertLib, MetaCoin);


    const token = await Token.deployed();
    console.log(
      `Token deployed at ${token.address} in network: ${network}.`
    );
  };
};


// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {}
