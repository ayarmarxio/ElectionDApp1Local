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
    // Store candidate    
    // Fetch candidates 
    mapping(uint => Candidate) public candidates;

    // Store candidates count
    uint public candidatesCount;

    // Constructor 
    function Election() public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2"); 
    }

    function addCandidate (string _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote (uint _candidateId) public {
        // require that they haven´t voted before
        require(!voters[msg.sender]);

        // require a a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        // record that voter has voted
        voters[msg.sender] = true;        
        // update candidate vote count
        candidates[_candidateId].voteCount ++;
    }
}