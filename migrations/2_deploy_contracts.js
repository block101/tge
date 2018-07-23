var PopToken = artifacts.require("./PopToken.sol");
var PopTokenSale = artifacts.require("./PopTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(PopToken, 1000).then(function() {
    var tokenPrice = 1000000000000000; // 0.001 Ether
    return deployer.deploy(PopTokenSale, PopToken.address, tokenPrice);
  });
};