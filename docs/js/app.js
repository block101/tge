App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("PopTokenSale.json", function(popTokenSale) {
      App.contracts.PopTokenSale = TruffleContract(popTokenSale);
      App.contracts.PopTokenSale.setProvider(App.web3Provider);
      App.contracts.PopTokenSale.deployed().then(function(popTokenSale) {
        console.log("Pop Token Sale Address:", popTokenSale.address);
      });
    }).done(function() {
      $.getJSON("PopToken.json", function(popToken) {
        App.contracts.PopToken = TruffleContract(popToken);
        App.contracts.PopToken.setProvider(App.web3Provider);
        App.contracts.PopToken.deployed().then(function(popToken) {
          console.log("Pop Token Address:", popToken.address);
        });
        App.listenForEvents();
        return App.render();
      });
    })
  },
  
  listenForEvents: function() {
    App.contracts.PopTokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;
    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.show();

    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html(account);
        console.log("Account Address:", App.account);
      }
    })

    App.contracts.PopTokenSale.deployed().then(function(instance) {
      popTokenSaleInstance = instance;
      return popTokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return popTokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      App.contracts.PopToken.deployed().then(function(instance) {
        popTokenInstance = instance;
        return popTokenInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.pop-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      })
    });
  },

  buyTokens: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    App.contracts.PopTokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 210000 // Gas limit
      });
    }).then(function(result) {
      console.log("Bought Tokens")
      $('form').trigger('reset') 
    });
  }

}

$(function() {
  $(window).load(function() {
    App.init();
  })
});
