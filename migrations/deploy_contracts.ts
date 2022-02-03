import Web3 from "web3";

type Network = "development" | "kovan" | "mainnet";

module.exports = (
    artifacts: Truffle.Artifacts, web3: Web3
    ) => {
  return async (
    deployer: Truffle.Deployer,
    network: Network,
    accountsList: string[]
  ) => {
    const Token = artifacts.require("Token");
    await deployer.deploy(Token);
    // await deployer.link(ConvertLib, MetaCoin);

    const Exchange = artifacts.require("Exchange");
    const accounts = await web3.eth.getAccounts();
    const feeAccount = accounts[0];
    const feePercent = 10;
    await deployer.deploy(Exchange, feeAccount, feePercent);

    const token = await Token.deployed();
    console.log(
      `Token deployed at ${token.address} in network: ${network}.`
    );

    const exchange = await Exchange.deployed();
    console.log(
      `Exchange deployed at ${exchange.address} in network: ${network}.`
    );
  };
};


// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {}
