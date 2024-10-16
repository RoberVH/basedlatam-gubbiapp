// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import 'forge-std/Test.sol';
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import '../src/GubbiRWATokenization.sol';
import '../src/ERC1155Gubbi.sol';

contract GubbiRWATokenizationTest is Test {
    ERC1155Gubbi public gubbiTokens;
    GubbiRWATokenization public rwaTokenization;

    address public owner = address(0x4444444444444444444400000000000044444444);
    address public issuer = address(0x1234567890000000000000000000000000000000);
    address public verifier1 = address(0x999999999999999999999999999999999999);
    address public verifier2 = address(0x888888888888888888888888888888888888);
    address public user1 = address(0x1111111111111111111111111111111111111111);
    address public user2 = address(0x2222222222222222222222222222222222222222);
    address public user3 = address(0x3333333333333333333333333333333333333333);
    
    uint256 constant MAX_INTEREST = 100000000;
    uint256 constant TOKEN_AMOUNT = 1000;
    uint256 constant validInterest = 5000000; // 5%
    uint256 constant totalPrice = 2000e8; // 2000 USDC
    

    function setUp() public {
        vm.label(owner, 'Owner');
        vm.label(issuer, 'Issuer');
        vm.label(verifier1, 'Verifier1');
        vm.label(verifier2, 'Verifier2');
        vm.label(user1, 'User1');
        vm.label(user2, 'User2');
        vm.label(user3, 'User3');
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

    // test setting roles Admin
    function testSetAdminRole() public {
        vm.startPrank(owner);
        assertEq(rwaTokenization.hasRole(rwaTokenization.DEFAULT_ADMIN_ROLE(), owner), true);
        rwaTokenization.setAdmin(user3);
        assertEq(rwaTokenization.hasRole(rwaTokenization.ADMIN_ROLE(), user3),true);
        assertEq(rwaTokenization.hasRole(rwaTokenization.ADMIN_ROLE(), user1), false);
        vm.stopPrank();
    }


    // test setting roles Verifiers
    function testSetVerifierRole() public {
        vm.startPrank(owner);
        assertEq(rwaTokenization.hasRole(rwaTokenization.DEFAULT_ADMIN_ROLE(), owner), true);
        rwaTokenization.setAdmin(user1);
        vm.stopPrank();
        //now user1 can set VERIFIER_ROLE
        vm.prank(user1);
        rwaTokenization.setVerifier(verifier1);
        assertEq(rwaTokenization.hasRole(rwaTokenization.VERIFIER_ROLE(), verifier1),true);
        assertEq(rwaTokenization.hasRole(rwaTokenization.VERIFIER_ROLE(), verifier2), false);
    }

    // test setting roles Verifiers
    function testRevokeRoleSucceded() public {
        //set and revoke ADMIN_ROLE
        vm.startPrank(owner);
        rwaTokenization.setAdmin(user1);
        assertEq(rwaTokenization.hasRole(rwaTokenization.ADMIN_ROLE(), user1), true);
        rwaTokenization.revokeRole(rwaTokenization.ADMIN_ROLE(), user1);
        assertEq(rwaTokenization.hasRole(rwaTokenization.ADMIN_ROLE(), user1), false);
        //a ADMIN_ROLE user sets and revokes VERIFIER_ROLE  
        rwaTokenization.setAdmin(user3);
        vm.stopPrank();
        vm.startPrank(user3);
        assertEq(rwaTokenization.hasRole(rwaTokenization.VERIFIER_ROLE(), verifier2), false);
        rwaTokenization.setVerifier(verifier2);
        assertEq(rwaTokenization.hasRole(rwaTokenization.VERIFIER_ROLE(), verifier2), true);
        rwaTokenization.setVerifierRevokedRole(verifier2);
        assertEq(rwaTokenization.hasRole(rwaTokenization.VERIFIER_ROLE(), verifier2), false);
        vm.stopPrank();
    }

    function grantPermissions(address _user, address _verifier) public {
        vm.prank(owner);
        rwaTokenization.setAdmin(_user);
        vm.prank(user1);
        rwaTokenization.setVerifier(_verifier);

    }

    // test succesful and failed change of verifier
    function testChangeVerifier() public {
        GubbiRWATokenization.tokenMetadata memory metadata = CreateRWATokenization(user2, 0);
        grantPermissions(user1, verifier1);
        grantPermissions(user2, verifier2);
        // first set  verifier1 on tokenId 0
        vm.startPrank(verifier1);
        rwaTokenization.setRWAVerifier(0);
        metadata = rwaTokenization.getRWAControlData(0);  // bring data back
        vm.stopPrank();
        assertEq(metadata.verifier, verifier1);
        // change it to verifier2
        vm.prank(user1);    // user1 is admin so can change Verifier
        rwaTokenization.changeVerifier(0,verifier2);
        metadata = rwaTokenization.getRWAControlData(0);  // bring data back
        assertEq(metadata.verifier, verifier2);
        // user3 doens't have rights so can't change verifier
        vm.startPrank(user3);    
        vm.expectRevert(
           abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user3, rwaTokenization.ADMIN_ROLE()
            )
        );
        rwaTokenization.changeVerifier(0,verifier1);
        vm.stopPrank();
        // user2 has permisions to change verifier but user 3 is not verifier
        vm.startPrank(user2);    
        vm.expectRevert(
           abi.encodeWithSelector(
                GubbiRWATokenization.GubbiRWAT_NotRWAVerifier.selector, 0, user3
            )
        );
        rwaTokenization.changeVerifier(0,user3);
        vm.stopPrank();
    }
    
    function testRevokeRoleFailed() public {
       //Non-ADMIN_ROLE user tries to set other Admin
       vm.startPrank(user1); 
       vm.expectRevert(
           abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user1, rwaTokenization.DEFAULT_ADMIN_ROLE()
            )
        );
        // lanza el error AccesControlUnauthorized(cuenta sin permiso que intento accion, role necesario. aqui es DEFAULT_ADMIN_ROLE = 0x00;)  
        rwaTokenization.setAdmin(user1);
        vm.stopPrank();
        // Non ADMIN_ROLE tries to revoke a VERIFIER_ROLE
        vm.prank(owner);
        rwaTokenization.setAdmin(user1);
        vm.prank(user1);  // user1 can grant verifier role now
        rwaTokenization.setVerifier(verifier1);
        assertEq(rwaTokenization.hasRole(rwaTokenization.VERIFIER_ROLE(), verifier1), true);
        vm.startPrank(user2);
        vm.expectRevert(
            abi.encodeWithSelector(
            IAccessControl.AccessControlUnauthorizedAccount.selector, user2, rwaTokenization.ADMIN_ROLE()
            )
        );
        rwaTokenization.setVerifierRevokedRole(verifier1);
        vm.stopPrank();
    }

    // Utility function
    function CreateRWATokenization(
        address user,
        uint256 presentIdToken
    ) public returns (GubbiRWATokenization.tokenMetadata memory) {
        // set contract GubiRWATokenization as ERC1155Gubbi issuer to allow minting
        vm.prank(user);
        rwaTokenization.createRWATokenization(
            TOKEN_AMOUNT,
            totalPrice,
            validInterest
        );
        GubbiRWATokenization.tokenMetadata memory metadata = rwaTokenization
            .getRWAControlData(presentIdToken); // first tokenId = 0
        return metadata;
    }

    //Test case Create a RWA and mint tokens
    function testCreationofRWATokens() public {
        GubbiRWATokenization.tokenMetadata
            memory metadata = CreateRWATokenization(user2, 0);
        assertEq(gubbiTokens.balanceOf(user2, metadata.tokenId), 1000);
        assertEq(metadata.issuer, user2);
        assertEq(metadata.interest, validInterest);
        assertEq(metadata.issuer, user2);
        assertEq(
            uint256(metadata.status),
            uint256(GubbiRWATokenization.AssetTokenizationStatus.CREATED)
        );
    }

    function testCreationofMultipleRWATokens() public {
        GubbiRWATokenization.tokenMetadata
            memory metadata1 = CreateRWATokenization(user1, 0);
        GubbiRWATokenization.tokenMetadata
            memory metadata2 = CreateRWATokenization(user2, 1);
        GubbiRWATokenization.tokenMetadata
            memory metadata3 = CreateRWATokenization(user3, 2);
        assertEq(metadata1.tokenId, 0);
        assertEq(metadata2.tokenId, 1);
        assertEq(metadata3.tokenId, 2);
        assertEq(gubbiTokens.balanceOf(user1, 0), 1000);
        assertEq(gubbiTokens.balanceOf(user2, 1), 1000);
        assertEq(gubbiTokens.balanceOf(user3, 2), 1000);
        assertEq(
            uint256(metadata1.status),
            uint256(GubbiRWATokenization.AssetTokenizationStatus.CREATED)
        );
        assertEq(
            uint256(metadata2.status),
            uint256(GubbiRWATokenization.AssetTokenizationStatus.CREATED)
        );
        assertEq(
            uint256(metadata3.status),
            uint256(GubbiRWATokenization.AssetTokenizationStatus.CREATED)
        );
    }

    // Test that creating a tokenization with an invalid interest rate fails
    function testCreateExceededMaxInterestRWA() public {
        uint256 invalidInterest = MAX_INTEREST + 1;

        vm.prank(owner); // Mock that the owner is sending the transaction
        vm.expectRevert(
            abi.encodeWithSelector(
                GubbiRWATokenization
                    .GubbiRWAT_InterestRateExceedsLimit
                    .selector,
                invalidInterest,
                MAX_INTEREST
            )
        );
        rwaTokenization.createRWATokenization(
            TOKEN_AMOUNT,
            totalPrice,
            invalidInterest
        );
    }


}
