// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import 'forge-std/Test.sol';
import '../src/GubbiRWATokenization.sol';
import '../src/ERC1155Gubbi.sol';

contract TransferTokens is Test {
    ERC1155Gubbi public gubbiTokens;
    GubbiRWATokenization public rwaTokenization;

    address public owner = address(0x4444444444444444444400000000000044444444);
    address public issuer = address(0x1234567890000000000000000000000000000000);
    address public verifier1 = address(0x999999999999999999999999999999999999);
    address public user1 = address(0x1111111111111111111111111111111111111111);
    address public user2 = address(0x2222222222222222222222222222222222222222);
    address public user3 = address(0x3333333333333333333333333333333333333333);
    address public user4 = address(0x4444444444444444444444444444444444444444);
    uint256 constant MAX_INTEREST = 100000000;
    uint256 constant TOKEN_AMOUNT = 1000;
    uint256 constant validInterest = 5000000; // 5%
    uint256 constant GlobaltotalPrice = 2000e8; // 2000 USDC



    function setUp() public {
        vm.label(owner, 'Owner');
        vm.label(issuer, 'Issuer');
        vm.label(user1, 'User1');
        vm.label(user2, 'User2');
        vm.label(user3, 'User3');
        vm.label(user4, 'User4');
        // Deploy the contract with a URI (for testing, we'll use an empty string)
        vm.startPrank(owner);
        gubbiTokens = new ERC1155Gubbi();
        rwaTokenization = new GubbiRWATokenization(address(gubbiTokens));
        gubbiTokens.setIssuer(address(rwaTokenization));
        vm.stopPrank();
    }

    // Test case to check that contract deployment works as expected
    function testDeployment() public view {
        assertEq(address(rwaTokenization).balance, 0);
        assertEq(gubbiTokens.getIssuer(), address(rwaTokenization));
        assertEq(gubbiTokens.owner(), owner);
    }

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
            validInterest
        );
        GubbiRWATokenization.tokenMetadata memory metadata = rwaTokenization
            .getRWAControlData(presentIdToken); // first tokenId = 0
        return metadata;
    }
//GubbiRWATokenization.tokenMetadata _metadata,uint256 _idToken, address _verifier) public {
    function grantPermissions(address _user, address _verifier) private {
        vm.prank(owner);
        rwaTokenization.setAdmin(_user);
        vm.prank(_user);
        rwaTokenization.setVerifier(_verifier);
    }

    function set3TransferPreconditions(address _owner) public {
        CreateRWATokenization(_owner, 0, 1500, 1500e8 ); // 1500 tokens 1500 USDC
        CreateRWATokenization(_owner, 1, 3500, 3700e8); // 3700 tokens 3700 USDC
        CreateRWATokenization(_owner, 2, 8000, 1000e8); // 1000 tokens 1000 USDC
        vm.prank(_owner);
        gubbiTokens.setApprovalForAll(address(rwaTokenization), true);
    }

    // test set verifier and verifier set Verified state
    function testSetVerifierandState() private {
        // user1 creates RWA Token
        uint256 tokenId=0;
        GubbiRWATokenization.tokenMetadata memory metadata = CreateRWATokenization(user1, tokenId, 1500, 1500e8 ); // 1500 tokens 1500 USDC
        grantPermissions(user1, verifier1);
        vm.startPrank(verifier1);
        rwaTokenization.setRWAVerifier(tokenId);  // set verifier1 as the verifier of RWA with tokenId
        rwaTokenization.setVerifiedStatus(tokenId); // verifier1 change status of RWA to VERIFIED
        vm.stopPrank();
        metadata =  rwaTokenization.getRWAControlData(0);  // bring back the data
        assertEq(metadata.verifier,verifier1);
        assertEq(
            uint256(metadata.status), 
            uint256(GubbiRWATokenization.AssetTokenizationStatus.VERIFIED));
    }

    function setVerifierPermssionAndOKRWA(address _verifier, uint256 tokenId) private {
        vm.startPrank(_verifier);
        rwaTokenization.setRWAVerifier(tokenId);  // set verifier1 as the verifier of RWA with tokenId
        rwaTokenization.setVerifiedStatus(0); // verifier1 change status of RWA to VERIFIED
        vm.stopPrank();
    }


    //test transfering tokens to other user
    function testTransferTokensSucced() public {
        grantPermissions(user4, verifier1);
        set3TransferPreconditions(user1);
        setVerifierPermssionAndOKRWA(verifier1,0);
        setVerifierPermssionAndOKRWA(verifier1,1);
        setVerifierPermssionAndOKRWA(verifier1,2);
        assertEq(gubbiTokens.isApprovedForAll(user1, address(rwaTokenization)),true);
        vm.prank(verifier1);
        rwaTokenization.setUnpausedTokens(0);
        vm.startPrank(address(rwaTokenization));
        gubbiTokens.safeTransferFrom(user1,user2,0,1000,'');
        vm.stopPrank();
        assertEq(gubbiTokens.balanceOf(user1, 0), 500);
        assertEq(gubbiTokens.balanceOf(user1, 0), 1000);
    }
    


        // Test Case - revert when trying to transfer approved trasnfer when token is paused. token is paused after minting until
    // a verifier unpaused it
    function testTransferofRWATokensFail() public {
        set3TransferPreconditions(user1);
        assertEq(gubbiTokens.balanceOf(user1, 0), 1500);
        assertEq(gubbiTokens.balanceOf(user1, 1), 3500);
        assertEq(gubbiTokens.balanceOf(user1, 2), 8000);
        assertEq(gubbiTokens.isApprovedForAll(user1, address(rwaTokenization)),true);
        vm.startPrank(address(rwaTokenization));
         vm.expectRevert(
            abi.encodeWithSelector(
                ERC1155Gubbi.ERC1155Gubi_TokenNotActive.selector, 0     // tokenId 0 is not active
            )
         );
        gubbiTokens.safeTransferFrom(user1,user2,0,1000,'');
        vm.stopPrank();
    }
}
