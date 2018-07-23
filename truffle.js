module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  // rinkeby test account: 0bc1316d10b55fe462540ed57a9f1c0983171958
  // get rinkeby tokens at: https://faucet.rinkeby.io/
  // https://twitter.com/100happysouls/status/1021044653179613190

  networks: {
    development: {
      host: "127.0.0.1",
      port: "7545",
      network_id: "*" // match any network id
  	},
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: 4,
      gas: 4700000
    }
  }
};
