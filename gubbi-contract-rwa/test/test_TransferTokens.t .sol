// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import 'forge-std/Test.sol';
//import '@openzeppelin/contracts/interfaces/draft-IERC6093.sol';
import { IERC1155Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import '../src/GubbiRWATokenization.sol';
import '../src/ERC1155Gubbi.sol';

contract TransferTokens is Test {
    ERC1155Gubbi public gubbiTokens;
    GubbiRWATokenization public rwaTokenization;

    address public owner = address(0x4444444444444444444400000000000044444444);
    address public issuer = address(0x1234567890000000000000000000000000000000);
    address public verifier1 = address(0x999999999999999999999999999999999999);
   address public verifier2 = address(0x888888888888888888888888888888888888);
    address public user1 = address(0x1111111111111111111111111111111111111111);
    address public user2 = address(0x2222222222222222222222222222222222222222);
    address public user3 = address(0x3333333333333333333333333333333333333333);
    address public user4 = address(0x4444444444444444444444444444444444444444);
    uint256 constant MAX_INTEREST = 100000000;
    uint256 constant TOKEN_AMOUNT = 1000;
    uint256 constant VALID_INTEREST = 5000000; // 5%
    uint256 constant TOTAL_PRICE = 2000e8; // 2000 USDC
    uint256 constant NINETY_DAYS = 7_776_000; // 90 dias en Unix epoch time



    function setUp() public {
        vm.label(owner, 'Owner');
        vm.label(issuer, 'Issuer');
        vm.label(verifier1, 'Verifier1');
        vm.label(verifier2, 'Verifier2');
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
            NINETY_DAYS
        );
        GubbiRWATokenization.tokenMetadata memory metadata = rwaTokenization.getRWAControlData(presentIdToken); // first tokenId = 0
        return metadata;
    }

    function grantPermissions(address _user, address _verifier) private {
        vm.prank(owner);
        rwaTokenization.setAdmin(_user);
        vm.prank(_user);
        rwaTokenization.setVerifier(_verifier);
    }

    function set3TransferPreconditions(address _owner) public {
        vm.prank(_owner);
        gubbiTokens.setApprovalForAll(address(rwaTokenization), true);
        CreateRWATokenization(_owner, 0, 1500, 1500e8 ); // 1500 tokens 1500 USDC
        CreateRWATokenization(_owner, 1, 3500, 3700e8); // 3700 tokens 3700 USDC
        CreateRWATokenization(_owner, 2, 8000, 1000e8); // 1000 tokens 1000 USDC
    }

    // test set verifier and verifier set Verified state
    function testSetVerifierandState() private {
        // user1 creates RWA Token
        uint256 tokenId=0;
        GubbiRWATokenization.tokenMetadata memory metadata = CreateRWATokenization(user1, tokenId, 1500, TOTAL_PRICE ); // 1500 tokens 1500 USDC
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
        rwaTokenization.setVerifiedStatus(tokenId); // verifier1 change status of RWA to VERIFIED
        vm.stopPrank();
    }


    //test transfering tokens to other user
    function testTransferTokensSucceeded() public {
        grantPermissions(user4, verifier1);
        set3TransferPreconditions(user1);
        setVerifierPermssionAndOKRWA(verifier1,0);
        setVerifierPermssionAndOKRWA(verifier1,1);
        setVerifierPermssionAndOKRWA(verifier1,2);
        assertEq(gubbiTokens.balanceOf(user1, 0), 1500);
        assertEq(gubbiTokens.balanceOf(user1, 1), 3500);
        assertEq(gubbiTokens.isApprovedForAll(user1, address(rwaTokenization)),true);
        vm.startPrank(verifier1);
        rwaTokenization.setUnpausedTokens(0);
        rwaTokenization.setUnpausedTokens(1);
        vm.stopPrank();
        vm.startPrank(address(rwaTokenization));
        gubbiTokens.safeTransferFrom(user1,user2,0,1000,'');
        gubbiTokens.safeTransferFrom(user1,user2,1,3000,'');
        vm.stopPrank();
        assertEq(gubbiTokens.balanceOf(user1, 0), 500);
        assertEq(gubbiTokens.balanceOf(user2, 0), 1000);
        assertEq(gubbiTokens.balanceOf(user1, 1), 500);
        assertEq(gubbiTokens.balanceOf(user2, 1), 3000);
    }
    


        // Test Case - revert when trying to transfer approved trasnfer when token is paused. token is paused after minting until
    // a verifier unpaused it
    function testTransferofRWATokensFail() public {
        set3TransferPreconditions(user1);
        assertEq(gubbiTokens.balanceOf(user1, 0), 1500);
        assertEq(gubbiTokens.balanceOf(user1, 1), 3500);
        assertEq(gubbiTokens.balanceOf(user1, 2), 8000);
        // allow contract rwaTokenization to move tokees from user1 balance to others
        assertEq(gubbiTokens.isApprovedForAll(user1, address(rwaTokenization)),true);
        vm.startPrank(address(rwaTokenization));
        vm.expectRevert(
            abi.encodeWithSelector(
                ERC1155Gubbi.ERC1155Gubi_TokenNotActive.selector, 0     // tokenId 0 is not active
            )
        );
        gubbiTokens.safeTransferFrom(user1,user2,0,500,'');
        vm.stopPrank();
        grantPermissions(user2, verifier2);
        setVerifierPermssionAndOKRWA(verifier2,1);  // verifier on token 1
         vm.prank(verifier2);
        rwaTokenization.setUnpausedTokens(1);
        // all conditions to transfer ok but wwe turn off transferpermisions granted previously to contract by owner of tokens (user1)
        vm.prank(user1);
        gubbiTokens.setApprovalForAll(address(rwaTokenization), false);
        vm.startPrank(address(rwaTokenization));
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC1155Errors.ERC1155MissingApprovalForAll.selector, address(rwaTokenization), user1     // operator (the one doing the )
            )
        );
        gubbiTokens.safeTransferFrom(user1,user2,1,500,'');
        // still sending TX as address(rwaTokenization) let's try to transfer more tokens that are available from TokenId 0
        // turn on again permissions
        vm.stopPrank();
        grantPermissions(user2, verifier1);
        vm.prank(user1);
        gubbiTokens.setApprovalForAll(address(rwaTokenization), true);
        setVerifierPermssionAndOKRWA(verifier1,0);  // verifier on token 0
        vm.prank(verifier1);
        rwaTokenization.setUnpausedTokens(0);
        vm.prank(address(rwaTokenization));
        //console.log('antes de transf',gubbiTokens.isApprovedForAll(user1, address(rwaTokenization)))
        gubbiTokens.safeTransferFrom(user1,user2,0,500,'');
        assertEq(gubbiTokens.balanceOf(user2, 0), 500);
        // ahora mueve mas del balnace (balance actual es 1500-500 =1000 )
        vm.startPrank(address(rwaTokenization));
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC1155Errors.ERC1155InsufficientBalance.selector, user1, 1000, 1100, 0    // address sender, uint256 balance, uint256 needed, uint256 tokenId
            )
        );        
         gubbiTokens.safeTransferFrom(user1,user2,0,1100,'');
        vm.stopPrank();
    }
}
