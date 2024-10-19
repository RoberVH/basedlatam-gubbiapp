// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import 'forge-std/Test.sol';
//import '@openzeppelin/contracts/interfaces/draft-IERC6093.sol';
import { IERC1155Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import "../lib/ITokenERC20forTesting.sol";
import '../src/GubbiRWATokenization.sol';
import '../src/ERC1155Gubbi.sol';


contract test_RWAlistedandSoldout is Test {

    address public owner = address(0x4444444444444444444400000000000044444444);
    address public issuer = address(0x1234567890000000000000000000000000000000);
    address public verifier1 = address(0x999999999999999999999999999999999999);
    address public verifier2 = address(0x888888888888888888888888888888888888);
    address public user1 = address(0x1111111111111111111111111111111111111111);
    address public user2 = address(0x2222222222222222222222222222222222222222);
    address public userBuyer1 = address(0x3333333333333333333333333333333333333333);
    address public userBuyer2 = address(0x9898989898989898989898989898989898989);
    address public userBuyer3 = address(0x5555555555555555555555555555555555555555);
    address public useradmin = address (0x6666666666666666666666666666666666666666);

    uint256 constant MAX_INTEREST = 100000000;
    uint256 constant TOKEN_AMOUNT = 1000;
    uint256 constant VALID_INTEREST = 5 * 1e4; // 5%
    uint256 constant TOTAL_PRICE = 200_000* 1e6; // 200,000 USDC
    GubbiRWATokenization.tokenMetadata metadata0;
    GubbiRWATokenization.tokenMetadata metadata1;
    GubbiRWATokenization.tokenMetadata metadata2;

    ERC1155Gubbi public gubbiTokens;
    GubbiRWATokenization public rwaTokenization;
    // ERC20 contract links reference from CIRCLE ( https://www.circle.com/en/multi-chain-usdc/base )
    address public constant  BASE_SEPOLIA_ERC20 = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;  
    address public constant  BASE_MAINNET_ERC20 = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;  
    address public constant BASE_ERC20 = BASE_SEPOLIA_ERC20;
    
    ITokenERC20forTesting usdc = ITokenERC20forTesting(BASE_ERC20);
    



    function setUp() public {
        vm.label(owner, 'Owner');
        vm.label(issuer, 'Issuer');
        vm.label(verifier1, 'Verifier1');
        vm.label(verifier2, 'Verifier2');
        vm.label(useradmin, 'useradmin');
        vm.label(user1, 'User1');
        vm.label(user2, 'User2');
        vm.label(userBuyer1, 'Buyer1');
        vm.label(userBuyer2, 'Buyer2');
        vm.label(userBuyer3, 'Buyer3');
        vm.label(address(usdc),"ERC20USDCCto");
        vm.label(address(this),"TestContract");
        vm.label(0xd74cc5d436923b8ba2c179b4bCA2841D8A52C5B5,"USDCImpCto");
        


        // Deploy the contract with a URI (for testing, we'll use an empty string)
        vm.startPrank(owner);
            gubbiTokens = new ERC1155Gubbi();
            rwaTokenization = new GubbiRWATokenization(address(gubbiTokens));
            gubbiTokens.setIssuer(address(rwaTokenization));
        vm.stopPrank();
        vm.label(address(rwaTokenization), 'GubbiRWACto');
        vm.label(address(gubbiTokens), 'ERC1155GubbiCto');

        // create some RWAs
        metadata0= CreateRWATokenization(user1, 0, 1500 * 1e6, TOTAL_PRICE ); // 1500 tokens 1500 USDC
        metadata1 = CreateRWATokenization(user1, 1, 3500 * 1e6, TOTAL_PRICE); // 3500 tokens 3500 USDC
        vm.prank(user1);
            gubbiTokens.setApprovalForAll(address(rwaTokenization), true);
        metadata2 = CreateRWATokenization(user2, 2, 8000 * 1e6, TOTAL_PRICE); // 1000 tokens 1000 USDC
        vm.prank(user2);
            gubbiTokens.setApprovalForAll(address(rwaTokenization), true);
        // create admin / verifier
        vm.prank(owner);
            rwaTokenization.setAdmin(useradmin);
        vm.startPrank(useradmin);
            rwaTokenization.setVerifier(verifier1);
            rwaTokenization.setVerifier(verifier2);
        vm.stopPrank();
        // set all rwa to VERIFIED
        // verifier1 -> rwa 0 and 1
        vm.startPrank(verifier1);
            rwaTokenization.setRWAVerifier(0);  // set verifier1 as the verifier of RWA with tokenId 0
            rwaTokenization.setVerifiedStatus(0); // verifier1 change status of RWA to VERIFIED
            rwaTokenization.setRWAVerifier(1);  // set verifier1 as the verifier of RWA with tokenId 1
            rwaTokenization.setVerifiedStatus(1); // verifier1 change status of RWA to VERIFIED
        vm.stopPrank();
        // verifier1 -> rwa 2
        vm.startPrank(verifier2);
            rwaTokenization.setRWAVerifier(2);  // set verifier1 as the verifier of RWA with tokenId
            rwaTokenization.setVerifiedStatus(2); // verifier1 change status of RWA to VERIFIED
        vm.stopPrank();
        // furbish buyers accounts with  USDC (USDC it's an ERC20 but it manages 6 decimals only!)
        deal(address(usdc), userBuyer1, 5000 * 1e6);
        deal(address(usdc), userBuyer2, 5000 * 1e6);
        deal(address(usdc), userBuyer3, 5000 * 1e6);
    }

                //contratoERC20_WABAX.approve(address(router), type(uint256).max);

    // Utility function
    function CreateRWATokenization(
        address user,
        uint256 presentIdToken,
        uint256 amount_quantity,
        uint256 totalPrice
    ) public returns (GubbiRWATokenization.tokenMetadata memory) {
        // set contract GubiRWATokenization as ERC1155Gubbi issuer to allow minting
        vm.prank(user);
        rwaTokenization.createRWATokenization(
            amount_quantity,
            totalPrice,
            VALID_INTEREST,
            90 days
        );
        GubbiRWATokenization.tokenMetadata memory metadata = rwaTokenization.getRWAControlData(presentIdToken); 
        return metadata;
    }

    function testUserListingRWA() public {
        vm.startPrank(user1);
            rwaTokenization.listRWA(0);
            rwaTokenization.listRWA(1);
        vm.stopPrank();
         vm.prank(user2);
             rwaTokenization.listRWA(2);
         metadata0 = rwaTokenization.getRWAControlData(0);
         metadata1 = rwaTokenization.getRWAControlData(1);
         metadata2 = rwaTokenization.getRWAControlData(2);
         assertEq(uint256(metadata0.status), uint256(GubbiRWATokenization.AssetTokenizationStatus.LISTED));
         assertEq(uint256(metadata1.status), uint256(GubbiRWATokenization.AssetTokenizationStatus.LISTED));
         assertEq(uint256(metadata2.status), uint256(GubbiRWATokenization.AssetTokenizationStatus.LISTED));
    }
    


    // test Buying the whole tokens from token Id 0
    function testbuyTokensOneshot() public {
        vm.startPrank(user1);
            rwaTokenization.listRWA(0);
            rwaTokenization.listRWA(1);
        vm.stopPrank();
        vm.prank(userBuyer1);
            usdc.approve(address(rwaTokenization), 1500 * 1e6); 
        // now we need to unpaused the tokens of tokenID 0. This is the RWA verifier task
        vm.prank(verifier1);
            rwaTokenization.setUnpausedTokens(0);
        vm.prank(userBuyer1);
            rwaTokenization.buyRWATokens(0, 1500 * 1e6);
        assertEq(gubbiTokens.balanceOf(userBuyer1,0), 1500 * 1e6);
        assertEq(usdc.balanceOf(address(rwaTokenization)), 0);
        assertEq(usdc.balanceOf(user1), 1500 * 1e6);  // user1 is left with 1500 USDC
        
    }

    function testbuyTokensseveralshots() public {
        vm.startPrank(user1);
            rwaTokenization.listRWA(0);
            assertEq( rwaTokenization.getRWAControlData(0).listedDay, block.timestamp,"BAD LISTED DAY");
            rwaTokenization.listRWA(1);
            assertEq( rwaTokenization.getRWAControlData(1).listedDay, block.timestamp,"BAD LISTED DAY");
        vm.stopPrank();
        // allow contract to transfer our usdc tokens to buy the RWA tokens
        vm.prank(userBuyer1);
            usdc.approve(address(rwaTokenization), 2500 * 1e6); 
        vm.prank(userBuyer2);
            usdc.approve(address(rwaTokenization), 1000 * 1e6); 
        vm.prank(userBuyer3);
            usdc.approve(address(rwaTokenization), 2500 * 1e6);                         
        // now we need to unpaused the tokens of tokenID 0. This is the RWA verifier task
        vm.startPrank(verifier1);
            rwaTokenization.setUnpausedTokens(0);
            rwaTokenization.setUnpausedTokens(1);
        vm.stopPrank();
        // rwa token 1 issued 3500 tokens
        vm.prank(userBuyer1); 
            rwaTokenization.buyRWATokens(1, 1000 * 1e6);       // left 2500 tokens
        assertEq(gubbiTokens.balanceOf(userBuyer1,1), 1000 * 1e6);
        vm.prank(userBuyer2);
            rwaTokenization.buyRWATokens(1, 500 * 1e6);       // left 2000 tokens
        assertEq(gubbiTokens.balanceOf(userBuyer2,1), 500 * 1e6);
        vm.prank(userBuyer1);
            rwaTokenization.buyRWATokens(1, 1500 * 1e6);       // left 500 tokens
        assertEq(usdc.balanceOf(user1), 0);          // user1 still didn't received any tokens
        assertEq(gubbiTokens.balanceOf(userBuyer1,1), 2500 * 1e6,"after 3rd buy. Not same balance");        // buyer1 accumulates 2500  in 2 buys
        assertEq(usdc.balanceOf(address(rwaTokenization)), 3000 * 1e6);   // contract has  collected  3000 usdc so far
        vm.prank(userBuyer2);
            rwaTokenization.buyRWATokens(1, 500 * 1e6);       // last  500 tokens - sold out
        assertEq(usdc.balanceOf(user1), 3500 * 1e6,"seller did not  have total tokens value: 3500");  // user1 is left with 1500 USDC
        assertEq(gubbiTokens.balanceOf(user1,1), 0,"seller still has some  tokens from tokenId 1!");  // user1 is left with 1500 USDC
    }

    function testRedemmTokens() public {
        vm.startPrank(user1);
            rwaTokenization.listRWA(1);
            metadata1=rwaTokenization.getRWAControlData(1);
        assertEq( metadata1.listedDay, block.timestamp,"BAD LISTED DAY");
        vm.stopPrank();
        vm.prank(userBuyer1);
            usdc.approve(address(rwaTokenization), 1000 * 1e6); 
        vm.prank(userBuyer2);
            usdc.approve(address(rwaTokenization), 1000 * 1e6); 
        vm.prank(userBuyer3);
            usdc.approve(address(rwaTokenization), 1500 * 1e6);                         
        // now we need to unpaused the tokens of tokenID 0. This is the RWA verifier task
        vm.startPrank(verifier1);
            rwaTokenization.setUnpausedTokens(0);
            rwaTokenization.setUnpausedTokens(1);
        vm.stopPrank();
        // rwa token 1 issued 3500 tokens
        vm.prank(userBuyer1);
            rwaTokenization.buyRWATokens(1, 1000 * 1e6);       // left 2500 tokens
        // assertEq(gubbiTokens.balanceOf(userBuyer1,1), 1000);
        vm.prank(userBuyer2);
            rwaTokenization.buyRWATokens(1, 500 * 1e6);       // left 2000 tokens
        // assertEq(gubbiTokens.balanceOf(userBuyer2,1), 500);
        vm.prank(userBuyer3);
            rwaTokenization.buyRWATokens(1, 1500 * 1e6);       // left 500 tokens
        // assertEq(usdc.balanceOf(user1), 0);          // user1 still didn't received any tokens
        // assertEq(gubbiTokens.balanceOf(userBuyer1,1), 2500,"after 3rd buy. Not same balance");        // buyer1 accumulates 2500  in 2 buys
       //  assertEq(usdc.balanceOf(address(rwaTokenization)), 3000);   // contract has  collected  3000 usdc so far
        vm.prank(userBuyer2);
            rwaTokenization.buyRWATokens(1, 500 * 1e6);       // last  500 tokens - sold out
        // this moment user1 has original 5000 + 3,500 USDC
        assertEq(usdc.balanceOf(user1), 3500 * 1e6, "USer1 doesn't have 3500 usdc");
        // assertEq(usdc.balanceOf(user1), 3500,"seller did not  have total tokens value: 3500");  // user1 is left with 1500 USDC
        // assertEq(gubbiTokens.balanceOf(user1,1), 0,"seller still has some  tokens from tokenId 1!");  // user1 is left with 1500 USDC
        // lets go to the future after maturity time
        uint256 expirationDate= metadata1.listedDay + metadata1.maturityPeriod;
        vm.warp(expirationDate);
        // let's repaid first
        // we need to deal some extra usdc to user1 to mimic real life gainings and that they can repaid plus interests
        // allow transfer of reapid interest first
        uint user1Bal= usdc.balanceOf(user1);
        deal(address(usdc), user1, user1Bal + (1000 * 1e6));  // they won 1000 USDC with the capital loan!
        uint repaidLoanQty = (metadata1.issuedTokens * (1e6 + metadata1.interest ))/ 1e6; // scale back to usdc decimals 
        vm.startPrank(user1);
            usdc.approve(address(rwaTokenization), repaidLoanQty);
            rwaTokenization.repaidTokens(1);
        vm.stopPrank();
        // lets have userBuyer2 collect they repayment
        // userBuyer has bougth 1000 1e6 tokens (1000 USDC) from RWA tokenId 1
         deal(address(usdc), userBuyer2,  (0 * 1e6)); // let's clear previous userBuyer USDC tokens balance for clarity
        vm.startPrank(userBuyer2);
            gubbiTokens.setApprovalForAll(address(rwaTokenization), true);
            rwaTokenization.tokensRedemption(1);
        vm.stopPrank();
        uint userBuyer2Bal= usdc.balanceOf(userBuyer2);
        console.log('UserBuyer bal', userBuyer2Bal);
        assertEq(userBuyer2Bal, (1000 + 50) * 1e6 );    // user will receive their original 1000 loan plus 50 USDC of interest
        console.log('rwaGubbi cto saldo tokenID 0: ', gubbiTokens.balanceOf(address(rwaTokenization),0));
        assertEq(gubbiTokens.balanceOf(address(rwaTokenization),0),0 );    
    }

}
