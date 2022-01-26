import {TokenContract, TokenInstance} from "../types/truffle-contracts";

const Token = artifacts.require('Token')

contract('Token', (accounts) => {
  let token: TokenInstance;
  const NAME = 'BMD Token';
  const SYMBOL = 'BMD';
  const DECIMALS = '18';
  const TOTAL_SUPPLY = '1000000000000000000000000';
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
      assert.equal(result.toString(), TOTAL_SUPPLY)
    });
  })
})

export {}
