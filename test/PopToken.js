var PopToken = artifacts.require("./PopToken.sol");

contract('PopToken', function(accounts) {
	var tokenInstance;

  it('should set the token values in the contract', function() {
    return PopToken.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.name();
    }).then(function(name) {
      assert.equal(name, 'Pop Token', 'should have the correct name');
      return tokenInstance.symbol();
    }).then(function(symbol) {
      assert.equal(symbol, 'POP', 'should have the correct symbol');
    });
  })

	it('should set the total supply of the tokens', function() {
		return PopToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 1000,'should set the total supply to 1000');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance) {
			assert.equal(adminBalance.toNumber(), 1000, 'should allot 1000 to admin account');
		});
	});

  it('should transfer token from one account to another account', function() {
    return PopToken.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.transfer.call(accounts[1], 9999);
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'should detect overbudget error');
      return tokenInstance.transfer.call(accounts[1], 10, { from: accounts[0] });
    }).then(function(success) {
      assert.equal(success, true, 'it should return true');
      return tokenInstance.transfer(accounts[1], 10, { from: accounts[0] });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, 'should trigger one event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
      assert.equal(receipt.logs[0].args._from, accounts[0], 'should log the from account');
      assert.equal(receipt.logs[0].args._to, accounts[1], 'should log the to account');
      assert.equal(receipt.logs[0].args._value, 10, 'should log the transfer amount');
      return tokenInstance.balanceOf(accounts[1]);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 10, 'should add the amount to the receiving account');
      return tokenInstance.balanceOf(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 990, 'should deduct the amount from the sending account');
    });
  });

  it('should approve tokens for delegated transfer', function() {
    return PopToken.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.approve.call(accounts[1], 50);
    }).then(function(success) {
      assert.equal(success, true, 'should return true');
      return tokenInstance.approve(accounts[1], 50, { from: accounts[0] });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, 'should trigger one event');
      assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
      assert.equal(receipt.logs[0].args._owner, accounts[0], 'should log the from account');
      assert.equal(receipt.logs[0].args._spender, accounts[1], 'should log the spender account');
      assert.equal(receipt.logs[0].args._value, 50, 'should log the transfer amount');
      return tokenInstance.allowance(accounts[0], accounts[1]);
    }).then(function(allowance) {
      assert.equal(allowance.toNumber(), 50, 'should store the allowance for delegated transfer');
    });
  });

  it('should perform delegated token transfers', function() {
    return PopToken.deployed().then(function(instance) {
      tokenInstance = instance;
      fromAccount = accounts[2];
      toAccount = accounts[3];
      spendingAccount = accounts[4]; // on behalf of fromAccount to spend money
      return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
    }).then(function(receipt) {
      return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
    }).then(function(receipt) {
      return tokenInstance.transferFrom(fromAccount, toAccount, 999, { from: spendingAccount });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'should not transfer amount larger than balance');
      return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'should not transfer amount larger than approved amount');
      return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
    }).then(function(success) {
      assert.equal(success, true);
      return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, 'should trigger one event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
      assert.equal(receipt.logs[0].args._from, fromAccount, 'should log the from account');
      assert.equal(receipt.logs[0].args._to, toAccount, 'should log the to account');
      assert.equal(receipt.logs[0].args._value, 10, 'should log the transfer amount');
      return tokenInstance.balanceOf(fromAccount);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 90, 'should deduct the amount from the from account');
      return tokenInstance.balanceOf(toAccount);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 10, 'should add the amount to the receiving account');
      return tokenInstance.allowance(fromAccount, spendingAccount);
    }).then(function(allowance) {
      assert.equal(allowance.toNumber(), 0, 'should deduct the amount from the allowance of the spender');
    });
  });

})