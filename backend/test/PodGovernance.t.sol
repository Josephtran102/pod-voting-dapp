// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/PodGovernance.sol";

contract PodGovernanceTest is Test {
    PodGovernance public governance;

    address alice = address(0xA1);
    address bob = address(0xB2);

    function setUp() public {
        governance = new PodGovernance();
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function testCreateProposal() public {
        vm.prank(alice);
        uint256 proposalId = governance.createProposal("Should we launch DAO?", 3600);

        (
            string memory description,
            uint256 yesVotes,
            uint256 noVotes,
            uint256 abstainVotes,
            uint256 endTime,
            bool exists
        ) = governance.getProposal(proposalId);

        assertEq(description, "Should we launch DAO?");
        assertEq(yesVotes, 0);
        assertEq(noVotes, 0);
        assertEq(abstainVotes, 0);
        assertGt(endTime, block.timestamp);
        assertTrue(exists);
    }

    function testVoteYes() public {
        vm.prank(alice);
        uint256 proposalId = governance.createProposal("Proposal 1", 3600);

        vm.prank(bob);
        governance.vote(proposalId, PodGovernance.VoteType.Yes);

        (, uint256 yesVotes, , , , ) = governance.getProposal(proposalId);
        assertEq(yesVotes, 1);

        PodGovernance.VoteType vote = governance.getVote(proposalId, bob);
        assertEq(uint8(vote), uint8(PodGovernance.VoteType.Yes));
    }

    function testVoteNo() public {
        vm.prank(alice);
        uint256 proposalId = governance.createProposal("Proposal 2", 3600);

        vm.prank(bob);
        governance.vote(proposalId, PodGovernance.VoteType.No);

        (, , uint256 noVotes, , , ) = governance.getProposal(proposalId);
        assertEq(noVotes, 1);

        PodGovernance.VoteType vote = governance.getVote(proposalId, bob);
        assertEq(uint8(vote), uint8(PodGovernance.VoteType.No));
    }

    function testChangeVote() public {
        vm.prank(alice);
        uint256 proposalId = governance.createProposal("Proposal 3", 3600);

        vm.prank(bob);
        governance.vote(proposalId, PodGovernance.VoteType.Yes);

        vm.prank(bob);
        governance.vote(proposalId, PodGovernance.VoteType.Abstain);

        (, , , uint256 abstainVotes, , ) = governance.getProposal(proposalId);
        assertEq(abstainVotes, 1);

        (, uint256 yesVotes, , , , ) = governance.getProposal(proposalId);
        assertEq(yesVotes, 0);
    }

    function testVoteAfterDeadlineShouldRevert() public {
        vm.prank(alice);
        uint256 proposalId = governance.createProposal("Expired Proposal", 1);

        skip(2);

        vm.expectRevert("Voting ended");
        vm.prank(bob);
        governance.vote(proposalId, PodGovernance.VoteType.Yes);
    }

    function testVoteInvalidProposalShouldRevert() public {
        vm.expectRevert("Proposal does not exist");
        vm.prank(bob);
        governance.vote(999, PodGovernance.VoteType.Yes);
    }

    function testVoteWithNotVotedEnumShouldRevert() public {
        vm.prank(alice);
        uint256 proposalId = governance.createProposal("Invalid Vote", 3600);

        vm.expectRevert("Invalid vote");
        vm.prank(bob);
        governance.vote(proposalId, PodGovernance.VoteType.NotVoted);
    }
}
