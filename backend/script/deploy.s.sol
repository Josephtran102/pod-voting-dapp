// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/PodGovernance.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        PodGovernance voting = new PodGovernance();

        console.log("PodGovernance deployed at: %s", address(voting));

        vm.stopBroadcast();
    }
}
