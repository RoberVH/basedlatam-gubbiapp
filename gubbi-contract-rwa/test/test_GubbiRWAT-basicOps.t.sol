// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "forge-std/Test.sol";
import "../src/GubbiRWATokenization.sol";
import "../src/ERC1155Gubbi.sol";

contract GubbiRWATokenizationTest is Test {
    ERC1155Gubbi public gubbiTokens;
    GubbiRWATokenization public rwaTokenization;

    address public owner = address(0x4444444444444444444400000000000044444444);
    address public issuer = address(0x123456789000000000000000000000000000000);
    address public verifier1 = address(0x999999999999999999999999999999999999);
    address public user1 = address(0x1111111111111111111111111111111111111111);
    address public user2 = address(0x2222222222222222222222222222222222222222);
    address public user3 = address(0x3333333333333333333333333333333333333333);
    uint256 constant MAX_INTEREST = 100000000;
    uint256 constant TOKEN_AMOUNT = 1000;
    uint256 constant validInterest = 5000000; // 5%
    uint256 constant totalPrice = 2000e8; // 2000 USDC

    function setUp() public {
        vm.label(owner, "Owner");
        vm.label(issuer, "Issuer");
        vm.label(user1, "User1");
        vm.label(user2, "User2");
        vm.label(user2, "User3");

        // Deploy the contract with a URI (for testing, we'll use an empty string)

        vm.startPrank(owner);
        gubbiTokens= new ERC1155Gubbi();
        rwaTokenization = new GubbiRWATokenization(address(gubbiTokens));
        gubbiTokens.setIssuer(address(rwaTokenization));
        vm.stopPrank();
    }

    // Test case to check that contract deployment works as expected
    function testDeployment() public view {
        assertEq(address(rwaTokenization).balance, 0);
        assertEq(gubbiTokens.getIssuer(), address(rwaTokenization));
        assertEq(rwaTokenization.owner(), owner);
        assertEq(gubbiTokens.owner(), owner);
    }
    
    // Utility function
    function CreateRWATokenization(address user,uint256 presentIdToken) public returns (GubbiRWATokenization.tokenMetadata memory) {
        // set contract GubiRWATokenization as ERC1155Gubbi issuer to allow minting
        vm.prank(user);
        rwaTokenization.createRWATokenization(TOKEN_AMOUNT, totalPrice, validInterest);
        GubbiRWATokenization.tokenMetadata memory metadata = rwaTokenization.getRWAControlData(presentIdToken); // first tokenId = 0
        return metadata;
    }

    //Test case Create a RWA and mint tokens 
    function testCreationofRWATokens() public {
        GubbiRWATokenization.tokenMetadata memory metadata = CreateRWATokenization(user2,0);
        assertEq(gubbiTokens.balanceOf(user2, metadata.tokenId), 1000);
        assertEq(metadata.issuer, user2);
        assertEq(metadata.interest, validInterest);
        assertEq(uint256(metadata.status), uint256(GubbiRWATokenization.AssetTokenizationStatus.CREATED));
    }


function testCreationofMultipleRWATokens() public {
        GubbiRWATokenization.tokenMetadata memory metadata1 = CreateRWATokenization(user1,0);
        GubbiRWATokenization.tokenMetadata memory metadata2 = CreateRWATokenization(user2,1);
        GubbiRWATokenization.tokenMetadata memory metadata3 = CreateRWATokenization(user3,2);
        assertEq(metadata1.tokenId,0);
        assertEq(metadata2.tokenId,1);
        assertEq(metadata3.tokenId,2);
        assertEq(gubbiTokens.balanceOf(user1, 0), 1000);
        assertEq(gubbiTokens.balanceOf(user2, 1), 1000);
        assertEq(gubbiTokens.balanceOf(user3, 2), 1000);
        assertEq(uint256(metadata1.status), uint256(GubbiRWATokenization.AssetTokenizationStatus.CREATED));
        assertEq(uint256(metadata2.status), uint256(GubbiRWATokenization.AssetTokenizationStatus.CREATED));
        assertEq(uint256(metadata3.status), uint256(GubbiRWATokenization.AssetTokenizationStatus.CREATED));
    }


    // Test that creating a tokenization with an invalid interest rate fails
    function testCreateExceededMaxInterestRWA() public {
        uint256 invalidInterest = MAX_INTEREST + 1;

        vm.prank(owner); // Mock that the owner is sending the transaction
        vm.expectRevert(
            abi.encodeWithSelector(
                GubbiRWATokenization.GubbiRWAT_InterestRateExceedsLimit.selector, invalidInterest, MAX_INTEREST
            )
        );
        rwaTokenization.createRWATokenization(TOKEN_AMOUNT, totalPrice, invalidInterest);
    }

    // Test Case - revert when trying to transfer approved trasnfer when token is paused. token is paused after minting until
    // a verifier unpaused it
    function testTransferofRWATokensFail() public {
        GubbiRWATokenization.tokenMetadata memory metadata = CreateRWATokenization(user1,0);
        vm.prank(user1);
        gubbiTokens.setApprovalForAll(address(rwaTokenization),true);
        assertEq(gubbiTokens.isApprovedForAll(user1, address(rwaTokenization)), true);
        assertEq(gubbiTokens.balanceOf(user1, metadata.tokenId), 1000);
        vm.prank(address(rwaTokenization));
         vm.expectRevert(  abi.encodeWithSelector( ERC1155Gubbi.ERC1155Gubi_TokenNotActive.selector, 0) );
        gubbiTokens.safeTransferFrom(user1,user2, metadata.tokenId, 750, "");
    }

        // Test Case - revert when trying to transfer approved trasnfer when token is paused. token is paused after minting until
    // a verifier unpaused it
    function testTransferofRWATokensSucceed() public {
        GubbiRWATokenization.tokenMetadata memory metadata = CreateRWATokenization(user1,0);
        vm.prank(user1);
        gubbiTokens.setApprovalForAll(address(rwaTokenization),true);
        assertEq(gubbiTokens.isApprovedForAll(user1, address(rwaTokenization)), true);
        assertEq(gubbiTokens.balanceOf(user1, metadata.tokenId), 1000);
        vm.prank(owner);
        rwaTokenization.setVerifier(verifier1, 'Salomon Valtierra');
        vm.prank(verifier1);
        
        vm.prank(address(rwaTokenization));
         vm.expectRevert(  abi.encodeWithSelector( ERC1155Gubbi.ERC1155Gubi_TokenNotActive.selector, 0) );
        gubbiTokens.safeTransferFrom(user1,user2, metadata.tokenId, 750, "");
    }



        
}
