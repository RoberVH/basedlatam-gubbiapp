// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ERC1155Gubbi.sol";

contract test_ERC1155Gubbi is Test {
    ERC1155Gubbi public token;

    address public owner;
    address public issuer;
    address public user1;
    address public user2;
    address public user3;

     function setUp() public {
        owner = address(this);
        issuer = address(0x1);
        user1 = address(0x2);
        user2 = address(0x3);
        user3 = address(0x4);

        token = new ERC1155Gubbi("https://token-cdn-domain/{id}.json");
        token.setIssuer(issuer);

        vm.label(address(token), "ERC1155Gubbi");
        vm.label(owner, "Owner");
        vm.label(issuer, "Issuer");
        vm.label(user1, "User1");
        vm.label(user2, "User2");
    }

    function testMint() public {
        uint256 tokenId = 1;
        uint256 amount = 100;
        string memory tokenUri = "https://example.com/token/1";

        vm.prank(issuer);
        token.mint(user1, tokenId, amount, "", tokenUri);

        assertEq(token.balanceOf(user1, tokenId), amount);
        assertEq(token.uri(tokenId), tokenUri);
    }

    function testMintBatch() public {
        uint256[] memory ids = new uint256[](3);
        ids[0] = 1;
        ids[1] = 2;
        ids[2] = 234;
        uint256 ids_3 = 5019;

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 100;
        amounts[1] = 200;
        amounts[2] = 10000;
        uint256 amounts_3 = 250;

        string[] memory uris = new string[](3);
        uris[0] = "https://example.com/token/1";
        uris[1] = "https://example.com/token/2";
        uris[2] = "https://example.com/token/3";
        string memory uris_3 = "https://example.com/token/4";

        vm.startPrank(issuer);
        token.mintBatch(user1, ids, amounts, "", uris);
        token.mint(user2, ids_3, 250,"",uris_3);
        token.mint(user3, ids_3, 250,"",uris_3);
        vm.stopPrank();

        assertEq(token.balanceOf(user1, ids[0]), amounts[0]);
        assertEq(token.balanceOf(user1, ids[1]), amounts[1]);
        assertEq(token.balanceOf(user1, ids[2]), amounts[2]);
        assertEq(token.balanceOf(user2, ids_3), amounts_3);
        assertEq(token.balanceOf(user3, ids_3), amounts_3);
        assertEq(token.uri(ids[0]), uris[0]);
        assertEq(token.uri(ids[1]), uris[1]);
        assertEq(token.uri(ids[2]), uris[2]);
        
    }
 
    function testBurn() public {
        uint256 tokenId = 10;
        uint256 amount = 100;

        vm.prank(issuer);
        token.mint(user1, tokenId, amount, "", "");
        /*user1 that was minted to now will aprove issuer to burn tokens*/
        vm.prank(user1);
        token.setApprovalForAll(issuer,true);
        // once allowed. issuer can burn half tokens
        vm.prank(issuer);
        token.burn(user1, tokenId, amount / 2);
        console.log('user1 tokens', token.balanceOf(user1, tokenId));
        assertEq(token.balanceOf(user1, tokenId), amount / 2);
    }

 
    function testBurnBatch() public {
        uint256[] memory ids = new uint256[](2);
        ids[0] = 1;
        ids[1] = 2;

        uint256[] memory mintAmounts = new uint256[](2);
        mintAmounts[0] = 100;
        mintAmounts[1] = 200;

        uint256[] memory burnAmounts = new uint256[](2);
        burnAmounts[0] = 50;
        burnAmounts[1] = 100;

        vm.prank(issuer);
        token.mintBatch(user1, ids, mintAmounts, "", new string[](2));
        console.log('balance token 1 user1', token.balanceOf(user1, ids[0]));
        console.log('balance token 2 user2', token.balanceOf(user1, ids[1]));
        vm.prank(user1);
        token.setApprovalForAll(issuer, true);
        vm.prank(issuer);
        token.burnBatch(user1, ids, burnAmounts);
        console.log('balance token 2 user2 despues', token.balanceOf(user1, ids[0]));
        console.log('balance token 1 user1 despues', token.balanceOf(user1, ids[1]));

        assertEq(token.balanceOf(user1, ids[0]), mintAmounts[0] - burnAmounts[0]);
        assertEq(token.balanceOf(user1, ids[1]), mintAmounts[1] - burnAmounts[1]);
    }

    function testOnlyIssuerCanMint() public {
        vm.expectRevert(abi.encodeWithSelector(ERC1155Gubbi.ERC1155Core_CallerIsNotIssuerOrItself.selector, user1));
        vm.prank(user1);
        token.mint(user2, 1, 100, "", "");
    }

    function testOnlyOwnerCanSetIssuer() public {
        vm.expectRevert("Only callable by owner");
        vm.prank(user1);
        token.setIssuer(user2);
    }
    
}
