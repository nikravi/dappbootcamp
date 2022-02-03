import {TokenContract, TokenInstance} from "../types/truffle-contracts";
import { Transfer, Approval } from "../types/truffle-contracts/Token";
import { EVM_REVERT, tokens } from "./helpers";
import * as chai from 'chai'    
import chaiAsPromised from 'chai-as-promised'
import { AllEvents } from "../types/truffle-contracts/Migrations";
chai.use(chaiAsPromised)

const Token = artifacts.require('Token')


contract('Token', ([deployer, receiver, exchange]) => {
  let token: TokenInstance;
  const NAME = 'BMD Token';
  const SYMBOL = 'BMD';
  const DECIMALS = '18';
  const TOTAL_SUPPLY = tokens(1000000);
  beforeEach(async () => {
    token = await Token.new();
  })

  describe("deployment", () => {
    it('tracks the name', async () => {
      const name = await token.name()
      assert.equal(name, NAME)
    })

    it('tracks the symbol', async () => {
      const result = await token.symbol();
      assert.equal(result, SYMBOL)
    });

    it('tracks the decimals', async () => {
      const result = await token.decimals();
      assert.equal(result.toString(), DECIMALS)
    });

    it('tracks the totalSupply', async () => {
      const result = await token.totalSupply();
      assert.equal(result.toString(), TOTAL_SUPPLY.toString())
    });

    it('assigns the total supply to deployer', async() => {
      const result = await token.balanceOf(deployer);
      assert.equal(result.toString(), TOTAL_SUPPLY.toString())
    })
  })

  describe('sending tokens', () => {
    let amount: any;
    let result: Truffle.TransactionResponse<Transfer>
    describe('success', async () => {
      beforeEach(async () => {
        amount = tokens (100);
        result = await token.transfer(receiver, amount, {
          from: deployer
        }) as Truffle.TransactionResponse<Transfer>
      })
      it('is able to send tokens', async() => {
        let balanceOf
        balanceOf = await token.balanceOf(receiver);
        assert.equal(balanceOf.toString(), amount.toString())
        balanceOf = await token.balanceOf(deployer);
        assert.equal(balanceOf.toString(), tokens(999900).toString())
      })
  
      it('emits a transfer event', async () => {
        const log = result.logs[0]
        assert.equal(log.event, 'Transfer')
        const event = log.args;
        assert.equal(event.from, deployer)
        assert.equal(event.to, receiver)
        assert.equal(event.value.toString(), amount.toString())
      })
    })

    describe('failure', async () => {
      it ('rejects insufficient balances', async () => {
        let invalidAmount: any;
        invalidAmount = tokens(100000000); // 100M > totalSupply
        await token.transfer(receiver, invalidAmount, {
            from: deployer
          }).should.be.rejectedWith(EVM_REVERT);

        invalidAmount = tokens(10); // 100M > totalSupply
        await token.transfer(deployer, invalidAmount, {
            from: receiver
          }).should.be.rejectedWith(EVM_REVERT)
      })

      // looks like 0.8 is handling invalid addresses
      // it('rejects invalid recipients', async() => {
      //   await token.transfer('0x0', amount, {
      //     from: deployer
      //   }).should.be.rejectedWith(EVM_REVERT)
      // })
    })

    describe ('approving tokens', () => {
      let result:  Truffle.TransactionResponse<Approval>;
      let amount: any

      beforeEach(async () => {
        amount = tokens(100)
        result = await token.approve(exchange, amount, { from: deployer}) as Truffle.TransactionResponse<Approval>
      })

      describe('success', () => {
        it ('allocates an allowence for delegated token spending on exchange', async() => {
          const allowance = await token.allowance(deployer, exchange)
          allowance.toString().should.equal(amount.toString())
        })

        it('emits an Approval event', async () => {
          const log = result.logs[0]
          assert.equal(log.event, 'Approval')
          const event = log.args;
          assert.equal(event._owner, deployer)
          assert.equal(event._spender, exchange)
          assert.equal(event._value.toString(), amount.toString())
        })
        
      })

      describe('failure', () => {
        
      })
    })
  })

  describe('delegated token transfers', () => {
    let amount: any;
    let result: Truffle.TransactionResponse<Transfer>

    beforeEach(async () => {
      amount = tokens (100);
      await token.approve(exchange, amount, { from: deployer})
    })

    describe('success', async () => {
      beforeEach(async () => {
        result = await token.transferFrom(deployer, receiver, amount, {
          from: exchange
        }) as Truffle.TransactionResponse<Transfer>
      })
      it('is able to send tokens', async() => {
        let balanceOf
        balanceOf = await token.balanceOf(receiver);
        assert.equal(balanceOf.toString(), amount.toString())
        balanceOf = await token.balanceOf(deployer);
        assert.equal(balanceOf.toString(), tokens(999900).toString())
      })
  
      it ('resets the allowance', async() => {
        const allowance = await token.allowance(deployer, exchange)
        allowance.toString().should.equal('0')
      })


      it('emits a transfer event', async () => {
        const log = result.logs[0]
        assert.equal(log.event, 'Transfer')
        const event = log.args;
        assert.equal(event.from, deployer)
        assert.equal(event.to, receiver)
        assert.equal(event.value.toString(), amount.toString())
      })
    })

    describe('failure', async () => {
      it ('rejects insufficient balances', async () => {
        let invalidAmount: any;
        invalidAmount = tokens(100000000); // 100M > totalSupply
        await token.transferFrom(deployer, receiver, invalidAmount, {
            from: exchange
          }).should.be.rejectedWith(EVM_REVERT);
      })

      // looks like 0.8 is handling invalid addresses
      // it('rejects invalid recipients', async() => {
      //   await token.transfer('0x0', amount, {
      //     from: deployer
      //   }).should.be.rejectedWith(EVM_REVERT)
      // })
    })

  })
})

export {}
