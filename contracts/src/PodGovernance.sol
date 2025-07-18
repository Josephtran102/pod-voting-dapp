// contracts/src/PodGovernance.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract PodGovernance {
    enum VoteType { NotVoted, Yes, No, Abstain }
    
    struct Proposal {
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 abstainVotes;
        uint256 endTime;
        bool exists;
        mapping(address => VoteType) votes;
    }
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    event ProposalCreated(uint256 indexed id, string description, uint256 endTime);
    event VoteCast(uint256 indexed proposalId, address indexed voter, VoteType vote);
    
    function createProposal(string memory _description, uint256 _duration) external returns (uint256) {
        proposalCount++;
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.description = _description;
        newProposal.endTime = block.timestamp + _duration;
        newProposal.exists = true;
        
        emit ProposalCreated(proposalCount, _description, block.timestamp + _duration);
        return proposalCount;
    }
    
    function vote(uint256 _proposalId, VoteType _vote) external {
        require(proposals[_proposalId].exists, "Proposal does not exist");
        require(block.timestamp < proposals[_proposalId].endTime, "Voting ended");
        require(_vote != VoteType.NotVoted, "Invalid vote");
        
        Proposal storage proposal = proposals[_proposalId];
        VoteType previousVote = proposal.votes[msg.sender];
        
        // Remove previous vote if exists
        if (previousVote == VoteType.Yes) {
            proposal.yesVotes--;
        } else if (previousVote == VoteType.No) {
            proposal.noVotes--;
        } else if (previousVote == VoteType.Abstain) {
            proposal.abstainVotes--;
        }
        
        // Add new vote
        if (_vote == VoteType.Yes) {
            proposal.yesVotes++;
        } else if (_vote == VoteType.No) {
            proposal.noVotes++;
        } else if (_vote == VoteType.Abstain) {
            proposal.abstainVotes++;
        }
        
        proposal.votes[msg.sender] = _vote;
        emit VoteCast(_proposalId, msg.sender, _vote);
    }
    
    function getProposal(uint256 _proposalId) external view returns (
        string memory description,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 abstainVotes,
        uint256 endTime,
        bool exists
    ) {
        Proposal storage p = proposals[_proposalId];
        return (p.description, p.yesVotes, p.noVotes, p.abstainVotes, p.endTime, p.exists);
    }
    
    function getVote(uint256 _proposalId, address _voter) external view returns (VoteType) {
        return proposals[_proposalId].votes[_voter];
    }
    
    function getTotalVotes(uint256 _proposalId) external view returns (uint256) {
        Proposal storage p = proposals[_proposalId];
        return p.yesVotes + p.noVotes + p.abstainVotes;
    }
}
