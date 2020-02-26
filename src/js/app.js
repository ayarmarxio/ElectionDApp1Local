var capturedFile 

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },
  
  initWeb3: function() {
  
    ethereum.enable()    
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      console.log("This is my current provider: " + App.web3Provider);
      web3 = new Web3(web3.currentProvider);
    }    
    else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
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
      }
    });

    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
          return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();
      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];
          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);
          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
      // return electionInstance.Voter.hasVoted[App.account]
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
    var candidateId = $('#candidatesSelect').val();   
    console.log("Starting the vote") 
    recordVote(capturedFile, candidateId)
  },
};

 function captureFile(){
  file = document.getElementById("my_file").files[0];  
  var reader = new FileReader();
  reader.onload = function() {
   capturedFile = reader.result
 }
 reader.readAsArrayBuffer(file);
}

async function recordVote (file, candidateId) {  
  console.log("Are we recording the vote???")
  
  // With infura
  const ipfs = window.IpfsHttpClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
  console.log ("Is IPFS ready?" + ipfs)
  var ipfsHash
  
  // ipfs.add(file, (error, result) => {
  //     ipfsHash = result[0].hash;
  //     console.log("Your vote is about to be effected with this hash " + ipfsHash)
  //     App.contracts.Election.deployed().then(function(instance) {
  //       return instance.vote(candidateId, ipfsHash, { from: App.account });
  //     }).then(function(result) {
  //       // Wait for votes to update
  //       $("#content").hide();
  //       $("#loader").show();        
  //       $("#content").show();
  //       $("#finalMessage").html("Your vote is very important for democracy"); 
  //       var img = document.createElement('img'); 
  //       img.src =  "https://ipfs.infura.io/ipfs/"+ipfsHash
  //       document.getElementById('content').appendChild(img);      

  //     }).catch(function(err) {
  //       console.error(err);
  //     });
  //   if(error) {
  //     console.error(error)
  //     return
  //   }
  // })

  // ---- without infura: INfura server had a problem so this is the old version of the contract

  App.contracts.Election.deployed().then(function(instance) {
    return instance.vote(candidateId, { from: App.account });
  }).then(function(result) {
    // Wait for votes to update
    $("#content").hide();
    $("#loader").show();        
    $("#content").show();
    $("#finalMessage").html("Your vote is very important for democracy"); 
    var img = document.createElement('img'); 
    img.src =  "https://ipfs.infura.io/ipfs/"+ipfsHash
    document.getElementById('content').appendChild(img);      

  }).catch(function(err) {
    console.error(err);
  });
// if(error) {
//   console.error("Check because you have an error")
//   return
// }

}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
