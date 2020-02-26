// solium-disable linebreak-style
pragma solidity  ^0.4.24;

contract Election {
    
    // Model a candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;               
    }

    // Store accounts that has voted
    mapping(address => bool) public voters;
    // Store and Fetch candidate    
    mapping(uint => Candidate) public candidates;
    // Store Finger print of the voter
    string public hashFingerPrint;
    // Store candidates count
    uint public candidatesCount;
    // Constructor 
    function Election() public {
        addCandidate("Yellow Candidate");
        addCandidate("Orange Candidate"); 
    }
    function addCandidate (string _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }  
    
    function vote (uint _candidateId) public {        
        // require that they haven´t voted before
        require(!voters[msg.sender]);
        // require(!Voter.hasVoted[msg.sender]);
        // require a a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        // update candidate vote count
        candidates[_candidateId].voteCount ++;
        // record that voter has voted
        voters[msg.sender] = true;
    }

      // With INFURA and ITFS connection fopr fingerprint   
    // function vote (uint _candidateId, string _fingerPrint) public {        
    //     // require that they haven´t voted before
    //     require(!voters[msg.sender]);
    //     // require(!Voter.hasVoted[msg.sender]);
    //     // require a a valid candidate
    //     require(_candidateId > 0 && _candidateId <= candidatesCount);
    //     // update candidate vote count
    //     candidates[_candidateId].voteCount ++;
    //     //record voterFingerPrint
    //     hashFingerPrint = _fingerPrint;
    //     // record that voter has voted
    //     voters[msg.sender] = true;
    // }
    

    // Method for getting the hash
    // function getFingerPrint(address _key) public view returns (string){
    //     return hashFingerPrint;
    // }
}