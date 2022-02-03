const { ether } = require("../test/helpers");

const Token = artifacts.require('Token')
const Exchange = artifacts.require('Exchange');

module.exports = async function (callback) {
    try {
        const accounts = await web3.eth.getAccounts();

        const token = await Token.deployed()
        console.log('Token fetched', token.address);
        
        const exchange = await Exchange.deployed();
        console.log('Exchange fetched', exchange.address);
        
        const [sender, receiver] = accounts;
        let amount = web3.utils.toWei('10000', 'ether');
        await token.transfer(receiver, amount, { from: sender })
        console.log(`Transfered ${amount} tokens from ${sender} to ${receiver}`);
        
        const [user1, user2] = accounts;
        amount = 1
        await exchange.depositEther({ from: user1, value: ether(1)})
        console.log(`Deposited ${amount} Ether from ${user1}`);
        
        amount = 10000
        await token.approve(exchange.address, tokens(amount), {from: user2})
        console.log(`Approved ${amount} tokens from ${user2}`);

        await exchange.depositToken(token.address, tokens(amount), {from: user2})
        console.log(`Deposited ${amount} tokens from ${user2}`);
        
        
    }
    catch (err) {
        console.log('Error', err);
    }
    
    callback();
};

