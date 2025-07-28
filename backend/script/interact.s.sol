// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../contracts/PodGovernance.sol";

contract InteractScript is Script {
    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address contractAddress = vm.envAddress("GOV_CONTRACT");

        vm.startBroadcast(privateKey);

        PodGovernance gov = PodGovernance(contractAddress);

        uint256 proposalId = gov.createProposal("Add a new validator", 3600);
        console.log("Created proposal with ID:", proposalId);

        gov.vote(proposalId, PodGovernance.VoteType.Yes);
        console.log("Voted YES on proposal ID:", proposalId);

        (
            string memory description,
            uint256 yesVotes,
            uint256 noVotes,
            uint256 abstainVotes,
            uint256 endTime,
            bool exists
        ) = gov.getProposal(proposalId);

        console.log("Proposal summary:");
        console.log("Description:", description);
        console.log("Yes votes:", yesVotes);
        console.log("No votes:", noVotes);
        console.log("Abstain votes:", abstainVotes);
        console.log("End time:", endTime);
        console.log("Exists:", exists);

        vm.stopBroadcast();
    }
}
