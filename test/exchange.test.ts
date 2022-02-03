import {ExchangeContract, ExchangeInstance, TokenInstance} from "../types/truffle-contracts";
import { ether, ETHER_ADDRESS, EVM_REVERT, tokens } from "./helpers";
import * as chai from 'chai'    
import chaiAsPromised from 'chai-as-promised'
import { Cancel, Deposit, Order, Trade, Withdraw } from "../types/truffle-contracts/Exchange";
chai.use(chaiAsPromised)

const Exchange = artifacts.require('Exchange')
const Token = artifacts.require('Token')


contract('Exchange', ([deployer, feeAccount, user1, user2]) => {
    let exchange: ExchangeInstance;
    let token: TokenInstance;
    const feePercent = 10;
    beforeEach(async () => {
        exchange = await Exchange.new(feeAccount, feePercent);
        token = await Token.new();
        token.transfer(user1, tokens(100), { from: deployer })
    })

    describe('deployment', () => {
        it('tracks the fee account', async () => {
            const name = await exchange.feeAccount()
            assert.equal(name, feeAccount)
        })
        it('tracks the fee percent', async () => {
            const percent = await exchange.feePercent();
            assert.equal(percent.toString(), feePercent.toString())
        })
    })

    describe('fallback', () => {
        it('reverts when Ether is sent', async() => {
            await exchange.sendTransaction({ value: 1, from: user1}).should.be.rejectedWith(EVM_REVERT);
        })
    })

    describe('deposit Ether', async() => {
        let result: Truffle.TransactionResponse<Deposit>;
        let amount: any;
        beforeEach(async() => {
            amount = ether(1)
            result = await exchange.depositEther({
                from: user1,
                value: amount
            }) as Truffle.TransactionResponse<Deposit>
        })

        it('tracks ether deposit', async() => {
            const balance = await exchange.tokens(ETHER_ADDRESS, user1);
            assert.equal(balance.toString(), amount.toString());
        })

        
        it('emits a Deposit event', async () => {
            const log = result.logs[0]
            assert.equal(log.event, 'Deposit')
            const event = log.args;
            assert.equal(event.token, ETHER_ADDRESS)
            assert.equal(event.user, user1)
            assert.equal(event.amount.toString(), amount.toString())
            assert.equal(event.balance.toString(), amount.toString())
        })
        
    })

    describe('withdraw Ether', () => {
        let result: Truffle.TransactionResponse<Withdraw>;
        let amount: any;
        beforeEach(async() => {
            amount = ether(1)
            await exchange.depositEther({from: user1, value: amount})
        })

        describe('success', () => {
            beforeEach(async() => {
                result = await exchange.withdrawEther(amount, { from: user1}) as Truffle.TransactionResponse<Withdraw>;
            })

            it('withdraws Ether funds', async() => {
                const balance = await exchange.tokens(ETHER_ADDRESS, user1);
                assert.equal(balance.toString(), '0')
            })

            it('emits a Withdraw event', async () => {
                const log = result.logs[0]
                assert.equal(log.event, 'Withdraw')
                const event = log.args;
                assert.equal(event.token, ETHER_ADDRESS)
                assert.equal(event.user, user1)
                assert.equal(event.amount.toString(), amount.toString())
                assert.equal(event.balance.toString(), '0')
            })
            
        })

        describe('failure', () => {
            it ('rejects withdraws for insufficient balances', async() => {
                await exchange.withdrawEther(ether(100), { from: user1}).should.be.rejectedWith(EVM_REVERT)
            });
        })
    })

    describe('depositing tokens', () => {
        let result: Truffle.TransactionResponse<Deposit>
        let amount: any;
        
        beforeEach(async() => {
            amount = tokens(10);
        })

        describe('success', () => {
            beforeEach(async() => {
                await token.approve(exchange.address, amount, { from: user1});
                result = await exchange.depositToken(token.address, amount, {from: user1}) as Truffle.TransactionResponse<Deposit>;
            })

            it('tracks the token deposit', async () => {
                let balance = await token.balanceOf(exchange.address);
                assert.equal(balance.toString(), amount.toString());

                balance = await exchange.tokens(token.address, user1);
                assert.equal(balance.toString(), amount.toString())
            });

            it('emits a Deposit event', async () => {
                const log = result.logs[0]
                assert.equal(log.event, 'Deposit')
                const event = log.args;
                assert.equal(event.token, token.address)
                assert.equal(event.user, user1)
                assert.equal(event.amount.toString(), amount.toString())
                assert.equal(event.balance.toString(), amount.toString())
              })
        })
        describe('failure', () => {
            it('rejects Ether deposits', async () => {
                await exchange.depositToken(ETHER_ADDRESS, tokens(10), {
                    from: user1
                }).should.be.rejectedWith(EVM_REVERT);
            });
            it ('fails when no tokens are approved', async() => {
                await exchange.depositToken(token.address, amount, {from: user1}).should.be.rejectedWith(EVM_REVERT);
            });
        })
    })

    describe('withdrawing tokens', () => {
        let result: Truffle.TransactionResponse<Withdraw>;
        let amount: any;

        describe('success', () => {
            beforeEach(async() => {
                amount = tokens(10);
                await token.approve(exchange.address, amount, { from: user1 })
                await exchange.depositToken(token.address, amount, {from: user1})

                result = await exchange.withdrawToken(token.address, amount, { from: user1 }) as Truffle.TransactionResponse<Withdraw>;
            })

            it ('withdraws token funds', async() => {
                const balance = await exchange.tokens(token.address, user1)
                assert.equal(balance.toString(), '0')
            });

            it('emits a Withdraw event', async () => {
                const log = result.logs[0]
                assert.equal(log.event, 'Withdraw')
                const event = log.args;
                assert.equal(event.token, token.address)
                assert.equal(event.user, user1)
                assert.equal(event.amount.toString(), amount.toString())
                assert.equal(event.balance.toString(), '0')
            })
        })

        describe('failure', () => {
            beforeEach(async() => {
                amount = tokens(10);
                await token.approve(exchange.address, amount, { from: user1 })
                await exchange.depositToken(token.address, amount, { from: user1 })
            })

            it('fails to withdraw Ether', async () => {
                await exchange.withdrawToken(ETHER_ADDRESS, ether(1), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            });

            it('fails to withdraw invalid amount', async () => {
                await exchange.withdrawToken(token.address, tokens(1000), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            });
        })
    })

    describe('checking balance', () => {
        beforeEach(async() => {
            await exchange.depositEther({from: user1, value: ether(1)})
        })

        it ('returns user balance', async() => {
            const result = await exchange.balanceOf(ETHER_ADDRESS, user1)
            assert.equal(result.toString(), ether(1).toString())
        });
    })

    describe('making orders', () => {
        let result: Truffle.TransactionResponse<Order>;
        beforeEach(async() => {
            result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1 }) as Truffle.TransactionResponse<Order>;
        })

        it ('tracks the newly created order', async() => {
            const orderCount = await exchange.orderCount();
            assert.equal(orderCount.toString(), '1')

            const order = await exchange.orders('1') as any;
            
            order.id.toString().should.equal('1', 'id is correct')
            order.user.should.equal(user1, 'user is correct')
            order.tokenGet.should.equal(token.address, 'tokenGet is correct')
            order.amountGet.toString().should.equal(tokens(1).toString())
            order.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct');
            order.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
            order.timestamp.toString().length.should.be.at.least(1, 'timestamp present');
        });

        it ('emits an "Order" event', async () => {
            const log = result.logs[0]
            log.event.should.eq('Order')
            const event = log.args
            event.id.toString().should.equal('1', 'id is correct')
            event.user.should.equal(user1, 'user is correct')
            event.tokenGet.should.equal(token.address, 'tokenGet is correct')
            event.amountGet.toString().should.equal(tokens(1).toString())
            event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
            event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
            event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
        })
    })

    describe('order actions', () => {
        let amountTokensExchanged;
        beforeEach(async() => {
            await exchange.depositEther({ from: user1, value: ether(1)})
            await token.transfer(user2, tokens(100), { from: deployer })
            await token.approve(exchange.address, tokens(2), { from: user2 })
            await exchange.depositToken(token.address, tokens(2), { from: user2 })
            // user 1 makes an order
            await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1 })
        })
        describe('filling orders', () => {
            let result: Truffle.TransactionResponse<Trade>;
            describe('success', () => {
                beforeEach(async() => {
                    result = await exchange.fillOrder('1', { from: user2 }) as Truffle.TransactionResponse<Trade>
                })

                it('executes the trade & charges fees', async () => {
                    let balance;
                    balance = await exchange.balanceOf(token.address, user1)
                    assert.equal(balance.toString(), tokens(1).toString())

                    balance = await exchange.balanceOf(ETHER_ADDRESS, user2)
                    assert.equal(balance.toString(), ether(1).toString())

                    balance = await exchange.balanceOf(ETHER_ADDRESS, user1)
                    assert.equal(balance.toString(), '0')

                    balance = await exchange.balanceOf(token.address, user2)
                    // -1 token to user2, -0.1 to the exchange (fee)
                    assert.equal(balance.toString(), tokens(0.9).toString())

                    const feeAccount = await exchange.feeAccount();
                    balance = await exchange.balanceOf(token.address, feeAccount);
                    assert.equal(balance.toString(), tokens(0.1).toString());
                })

                it ('updates filled orders', async() => {
                    const orderFilled = await exchange.orderFilled(1);
                    orderFilled.should.equal(true)
                });

                it ('emits a Trade event', async() => {
                    const log = result.logs[0]
                    log.event.should.eq('Trade');
                    const event = log.args
                    event.id.toString().should.equal('1', 'id is correct')
                    event.user.should.equal(user1, 'user is correct')
                    event.tokenGet.should.equal(token.address)
                    event.amountGet.toString().should.equal(tokens(1).toString())
                    event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
                    event.amountGive.toString().should.equal(ether(1).toString());
                    event.timestamp.toString().length.should.be.at.least(1)
                    event.userFill.should.be.equal(user2)
                    event.user.should.be.equal(user1)
                });
            })

            describe('failure', () => {
                it ('rejects invalid order ids', async() => {
                    await exchange.fillOrder(9999, { from: user2}).should.be.rejectedWith(EVM_REVERT)
                });
                it ('rejects already filled orders', async() => {
                    // fill order
                    await exchange.fillOrder('1', { from: user2}).should.be.fulfilled
                    // fill again
                    await exchange.fillOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                });
            })
            
        })

        describe('cancelling orders', () => {
            beforeEach(async () => {
                await exchange.depositEther({ from: user1, value: ether(1) })
                await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1 })
            })
            let result: Truffle.TransactionResponse<Cancel>;
            describe('success', async () => {
                beforeEach(async () => {
                    result = await exchange.cancelOrder('1', { from: user1 }) as Truffle.TransactionResponse<Cancel>
                })

                it('updates cancelled orders', async () => {
                    const orderCancelled = await exchange.orderCanceled(1)
                    orderCancelled.should.equal(true)
                });

                it('emits a Cancel" event', async () => {
                    const log = result.logs[0]
                    log.event.should.eq('Cancel');
                    const event = log.args
                    event.id.toString().should.equal('1', 'id is correct')
                    event.user.should.equal(user1, 'user is correct')
                    event.tokenGet.should.equal(token.address)
                    event.amountGet.toString().should.equal(tokens(1).toString())
                    event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
                    event.amountGive.toString().should.equal(ether(1).toString());
                    event.timestamp.toString().length.should.be.at.least(1)
                })
            })

            describe('failure', () => {
                it('rejects an invalid order', async () => {
                    await exchange.cancelOrder(9999, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
                });
                it('rejects unauthorized cancelation', async () => {
                    await exchange.cancelOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                });
            })
        })
    })
});


export {}