// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/utils/Context.sol';
//import {OwnerIsCreator} from '@chainlink/contracts/src/v0.8/shared/access/OwnerIsCreator.sol';
import {ERC1155Gubbi} from './ERC1155Gubbi.sol';

/**
 *
 *
 */
/**
 * @title Contract GubbiRWATokenization.sol
 * @author rovicher.eth
 * @notice This contract governs RWA asset issuing and related finance activities
 *          Applies Gubbi rules and  logic to ERC1155 inherited contracts for RWA  Tokenization
 *          Users can post RWA with suggested pricing and tokens amount.
 *          A Gubbi aproved Verifier must review the asset and adjust price and total tokens amount
 *          A business rule that verifiers must apply is that an asset cannot be tokenized by more thatn 60% its real price at the moment
 *          of tokenization
 *
 */
contract GubbiRWATokenization is Context, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE');
    bytes32 public constant VERIFIER_ROLE = keccak256('MINTER_ROLE');

    uint256 constant MAX_INTEREST = 100000000; // Max Interest to ask for in a tokenization

    error GubbiRWAT_InterestRateExceedsLimit(
        uint256 providedRate,
        uint256 maxRate
    );
    error GubbiRWAT_AddressIsNotVerifier(address verifier);
    error GubbiRWAT_OnlyVerifierSetVERIFICATION(uint256 tokenId);
    error GubbiRWAT_WrongVerifierData(address _verfier, string _name);
    error GubbiRWAT_NotRWAVerifier(uint256 _token, address _verifier);

    enum AssetTokenizationStatus {
        CREATED,
        VERIFIED,
        MATURING,
        FULFILLED,
        CANCELED
    }

    // RWA tokenizatiion Data control struct
    struct tokenMetadata {
        uint256 tokenId;
        address issuer; // account owner of the RWA
        AssetTokenizationStatus status; // life cicle RWA Tokenization stage flags
        address verifier; // Address of Agent/Embassador/Broker recognized by Gubbi as a valir person to supervized RWA
        uint256 totalPrice;
        uint256 interest; // 8 decimals interes rate. Ejemplos de interest::
        // 100% = 100000000
        //   5% = 5000000
        //   3% = 3000000
    }

    
    
    // Gubbi-Verifier reviewing reputation 
    // it shows how good deals approbed by the verifier
    mapping(address verifierAddress => uint16 ) public verifierReputation;

    // Gubbi-tokenizer paying reputation 
    // it shows credit qulification based on repayment history of the tokenizer (user creating RWA)
    mapping(address tokenizer => uint16 ) public tokenizerReputation;

    // tokenId data Control information
    mapping(uint256 tokenId => tokenMetadata)  rwaControlData;


    // Optional mapping for token URIs
    mapping(uint256 tokenId => string) private _tokenURIs;

    uint256 private s_tokenIdCount = 0;
    ERC1155Gubbi private gubbiERC1155;

    event rwaCreatedEvent(
        uint256 indexed tokenId,
        uint256 amount,
        address indexed owner
    );

    event verifierRevoke(
        address indexed _verifier,
        address indexed _admin
    );

    constructor(address _ERC1155GubbiAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // sender has granting and revoking roles permissions now
        _grantRole(ADMIN_ROLE, msg.sender);         // sender also has admin role permission now
        _setRoleAdmin(VERIFIER_ROLE, ADMIN_ROLE);   // ADMIN_ROLE can manage VERIFIER_ROLE (grant and revok Verifier roles ) 
        gubbiERC1155 = ERC1155Gubbi(_ERC1155GubbiAddress);
    }


    /**
     * @notice Creates a new Real-World Asset (RWA) tokenization event.
     *         Mints ERC-1155 tokens to the contract itself and records metadata
     *         about the RWA tokenization, such as the issuer, status, and interest rate.
     *         USER MUST CALL contract.setApprovalForAll(GubbiRWATokenizationAddress, true) from client to
     *          allow the contract manage, sell and transfer the tokens
     * @dev This function validates that the interest rate does not exceed a maximum allowed value.
     *      The minted tokens are initially held by the contract to facilitate future transactions.
     * @param _amountTokens The number of ERC-1155 tokens to mint for this RWA tokenization.
     * @param _interest The interest rate applied to the tokenized asset, expressed with 8 decimals (e.g., 5% = 5000000).
     * @param _totalPrice The total price for the ASSET, each token will be worth totalPrice/amountTokens
     * @custom:require `_interest` must be less than or equal to `MAX_INTEREST`.
     * @custom:emit Emits an `rwaCreatedEvent` when the tokenization is successfully created.
     * @custom:error Reverts with `GubbiRWAT_InterestRateExceedsLimit` if `_interest` exceeds `MAX_INTEREST`.
     */
    function createRWATokenization(
        uint256 _amountTokens,
        uint256 _totalPrice,
        uint256 _interest
    ) external {
        if (_interest > MAX_INTEREST) {
            revert GubbiRWAT_InterestRateExceedsLimit(_interest, MAX_INTEREST);
        }
        //  tokens are minted to msg.sender
        address sender = msg.sender;
        gubbiERC1155.mint(
            sender,
            s_tokenIdCount,
            _amountTokens,
            '',
            'tokenUri'
        );
        rwaControlData[s_tokenIdCount] = tokenMetadata({
            tokenId: s_tokenIdCount,
            issuer: sender,
            status: AssetTokenizationStatus.CREATED,
            verifier: address(0),
            interest: _interest,
            totalPrice: _totalPrice
        });
        gubbiERC1155.pauseToken(s_tokenIdCount);
        emit rwaCreatedEvent(s_tokenIdCount, _amountTokens, sender);
        s_tokenIdCount++;
    }

    // Setters ****************************************************************************

    // Grant ADMIN_ROLE
    function setAdmin(address _admin) external onlyRole(DEFAULT_ADMIN_ROLE) {
            _grantRole(ADMIN_ROLE, _admin);
    }
    // Grant VERIFIER ROLE
    function setVerifier(address _verifier) external onlyRole(ADMIN_ROLE) {
            _grantRole(VERIFIER_ROLE, _verifier);
    }

    // REvoke verifier role
    function setVerifierRevokedRole(address _verifier ) external onlyRole(ADMIN_ROLE) {
            _revokeRole(VERIFIER_ROLE,_verifier);
            emit verifierRevoke(_verifier, msg.sender);
    }

    // Verifier register themselves as verifier of a specific RWA Tokenization
    function setRWAVerifier(uint256 _tokenId) external onlyRole(VERIFIER_ROLE) {
        rwaControlData[_tokenId].verifier = msg.sender;
    }

    // A safe guard in case something goes wrong with previous verifier
    function changeVerifier(uint _tokenId, address _newVerifier) external onlyRole(ADMIN_ROLE) {
        if (!hasRole(VERIFIER_ROLE, _newVerifier)) {
            revert GubbiRWAT_NotRWAVerifier(_tokenId, _newVerifier);
        }
        rwaControlData[_tokenId].verifier = _newVerifier;
    }

    // A verifier has checked the tokenization deal nad approves it for trading
    function setUnpausedTokens(uint256 _tokenId) external onlyRole(VERIFIER_ROLE) {
        address msgSender = msg.sender;
        if (rwaControlData[_tokenId].verifier != msgSender) {
            revert GubbiRWAT_NotRWAVerifier(_tokenId, msgSender);
        }
        gubbiERC1155.unpauseToken(_tokenId);
    }

    function setPauseTokens(uint _tokenId) external onlyRole(VERIFIER_ROLE) {
        address msgSender = msg.sender;
        if (rwaControlData[_tokenId].verifier != msgSender) {
            revert GubbiRWAT_NotRWAVerifier(_tokenId, msgSender);
        }
        gubbiERC1155.unpauseToken(_tokenId);
    }
    function setVerifiedStatus(uint256 _tokenId) external onlyRole(VERIFIER_ROLE) {
        if (rwaControlData[_tokenId].verifier != msg.sender) {
            revert GubbiRWAT_OnlyVerifierSetVERIFICATION(_tokenId);
        }
        //rwaControlData[_tokenId].status = AssetTokenizationStatus.VERIFIED;
        rwaControlData[0].totalPrice = 700e8;
        rwaControlData[0].status=AssetTokenizationStatus.VERIFIED;
    }

    // getters  ****************************************************************************

    function getAssetStatus(
        uint256 _tokenId
    ) public view returns (AssetTokenizationStatus) {
        return rwaControlData[_tokenId].status;
    }

    function getRWAControlData(
        uint256 _tokenId
    ) public view returns (tokenMetadata memory) {
        return rwaControlData[_tokenId];
    }
 
}
