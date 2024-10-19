// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script} from "forge-std/Script.sol";
import 'forge-std/Test.sol';
import {ERC1155Gubbi} from "../src/ERC1155Gubbi.sol";
import {GubbiRWATokenization} from "../src/GubbiRWATokenization.sol";

contract DeployGubbiContracts is Script, Test {
    function run() external returns (address, address) {
        // Retrieve key from .env
        uint256 deployerPrivateKey = vm.envUint("PVTE_KEY");
        
        // Start transaction
        vm.startBroadcast(deployerPrivateKey);

        // First deploy ERC1155 contract
        ERC1155Gubbi gubbiToken = new ERC1155Gubbi();
        
        // Second the RWA contract passing it ERC1155Gubbi contract
        GubbiRWATokenization gubbiRWA = new GubbiRWATokenization(
            address(gubbiToken)
        );

        vm.stopBroadcast();

       console.log("ERC1155Gubbi deployed to:", address(gubbiToken));
        console.log("GubbiRWATokenization deployed to:", address(gubbiRWA));

        // Return deployed addresses
        return (address(gubbiToken), address(gubbiRWA));
    }
}