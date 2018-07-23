var PopTokenSale = artifacts.require("./PopTokenSale.sol");
var PopToken = artifacts.require('./PopToken.sol');

contract('PopTokenSale', function(accounts) {
	var tokenSaleInstance;
	var tokenPrice = 1000000000000000; // in wei

    var tokensAvailable = 750;
    var numberOfTokens;
    var admin = accounts[0];
    var buyer = accounts[1];


	it('test the token sale contract with setup values', function() {
    return PopTokenSale.deployed().then(function(instance) {
      tokenSaleInstance = instance;
      return tokenSaleInstance.address
    }).then(function(address) {
      assert.notEqual(address, 0x0, 'should have token sale contract address');
      return tokenSaleInstance.tokenContract();
    }).then(function(address) {
      assert.notEqual(address, 0x0, 'should have token contract address');
      return tokenSaleInstance.tokenPrice();
    }).then(function(price) {
      assert.equal(price, tokenPrice, 'should have correct token price');
    });
  });


  it('test token buying', function() {
    return PopToken.deployed().then(function(instance) {
      tokenInstance = instance;
      return PopTokenSale.deployed();
    }).then(function(instance) {
      tokenSaleInstance = instance;
      return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin })
    }).then(function(receipt) {
      numberOfTokens = 10;
      return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice })
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, 'should triggers one event');
      assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
      assert.equal(receipt.logs[0].args._buyer, buyer, 'should log the account that purchased the tokens');
      assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'should log the number of tokens purchased');
      return tokenSaleInstance.tokensSold();
    }).then(function(amount) {
      assert.equal(amount.toNumber(), numberOfTokens, 'should have the number of tokens sold increased');
      return tokenInstance.balanceOf(buyer);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), numberOfTokens, 'should have the number of tokens from buyer');
      return tokenInstance.balanceOf(tokenSaleInstance.address);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens, 'should have tokens remaining in token sale contract');
      return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'msg.value should equal number of tokens in wei');
      return tokenSaleInstance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'should not purchase more tokens than available');
    });
  });

  it('test ending the token sale', function() {
    return PopToken.deployed().then(function(instance) {
      tokenInstance = instance;
      return PopTokenSale.deployed();
    }).then(function(instance) {
      tokenSaleInstance = instance;
      return tokenSaleInstance.endSale({ from: buyer });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert' >= 0, 'should be admin to end sale'));
      return tokenSaleInstance.endSale({ from: admin });
    }).then(function(receipt) {
      return tokenInstance.balanceOf(admin);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 990, 'should return the unsold pop tokens to admin');
      balance = web3.eth.getBalance(tokenSaleInstance.address)
      assert.equal(balance.toNumber(), 0);
    });
  });


})

