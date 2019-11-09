App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    ethereum.enable();
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      console.log("This is my current provider: " + App.web3Provider);
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },


  initContract: function() {
    $.getJSON("Election.json", function(election) {
      console.log("The init contract is running" )
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);
      return App.render();
    });
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();
    
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
        console.warn("you get the account: " + account)
      }
    });

    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      console.log("This is the instance that we pass: " + instance)
      electionInstance = instance;
      console.log("This is the instance of the contract object: " + electionInstance)
    
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      console.log("This is the candidates results : " + candidatesResults)
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      console.log("This is the candidateSelect" + candidatesSelect)
      candidatesSelect.empty();

      console.log("This is candidates count:  " + candidatesCount)

      for (var i = 1; i <= candidatesCount; i++) {
        console.log("This re the candidates count: " + candidatesCount);
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          console.log("This is the candidate id: " + id);
          var name = candidate[1];
          console.log("This is the candidate name: " + name);
          var voteCount = candidate[2];
          console.log("this is the votecount: " + voteCount)

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);
          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castVote: function() {
    console.log("We are in the VOTE SECTION")
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      console.log("ya le metimos el CONTRATO")
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      console.log("Aqui se deberia mostrar el final: ")
      $("#loader").show();
      $("#content").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
