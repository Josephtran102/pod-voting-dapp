// contracts/src/PodVoting.sol
pragma solidity ^0.8.26;

contract PodVoting {
    struct Proposal {
        string description;
        uint256 voteCount;
        uint256 endTime;
        bool exists;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    uint256 public proposalCount;
    
    event ProposalCreated(uint256 indexed id, string description, uint256 endTime);
    event VoteCast(uint256 indexed proposalId, address voter);
    
    function createProposal(string memory _description, uint256 _duration) external returns (uint256) {
        proposalCount++;
        proposals[proposalCount] = Proposal({
            description: _description,
            voteCount: 0,
            endTime: block.timestamp + _duration,
            exists: true
        });
        
        emit ProposalCreated(proposalCount, _description, block.timestamp + _duration);
        return proposalCount;
    }
    
    function vote(uint256 _proposalId) external {
        require(proposals[_proposalId].exists, "Proposal does not exist");
        require(block.timestamp < proposals[_proposalId].endTime, "Voting ended");
        require(!hasVoted[msg.sender][_proposalId], "Already voted");
        
        hasVoted[msg.sender][_proposalId] = true;
        proposals[_proposalId].voteCount++;
        
        emit VoteCast(_proposalId, msg.sender);
    }
}
