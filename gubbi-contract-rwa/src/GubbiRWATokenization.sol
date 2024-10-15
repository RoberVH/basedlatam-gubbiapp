// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

//import {ERC1155Supply, ERC1155} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
//import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
//import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
//import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import '@openzeppelin/contracts/utils/Context.sol';
import {OwnerIsCreator} from '@chainlink/contracts/src/v0.8/shared/access/OwnerIsCreator.sol';
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
contract GubbiRWATokenization is OwnerIsCreator, Context {
    ERC1155Gubbi private gubbiERC1155;

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

    // Verfier information data
    struct verifierInfo {
        string verifierName;
        uint8 reputation; // points Verifier has won
    }

    // Gubbi-approve Verifier white-list
    mapping(address verifierAddress => verifierInfo) public verifiersWhiteList;

    // tokenId data Control information
    mapping(uint256 tokenId => tokenMetadata) rwaControlData;

    // whitelist of verifiers

    // Optional mapping for token URIs
    mapping(uint256 tokenId => string) private _tokenURIs;

    uint256 private s_tokenIdCount = 0;

    event rwaCreatedEvent(
        uint256 indexed tokenId,
        uint256 amount,
        address indexed owner
    );

    modifier onlyVerifiers() {
        address msgSender = _msgSender();
        if (bytes(verifiersWhiteList[msgSender].verifierName).length == 0) {
            revert GubbiRWAT_AddressIsNotVerifier(msgSender);
        }
        _;
    }

    constructor(address _ERC1155GubbiAddress) {
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
    ) public {
        if (_interest > MAX_INTEREST) {
            revert GubbiRWAT_InterestRateExceedsLimit(_interest, MAX_INTEREST);
        }
        //  tokens are minted to contract to allow selling
        address sender = _msgSender();
        gubbiERC1155.mint(
            _msgSender(),
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

    function setVerifierIntoApprovedList(address _verifier, string memory _name ) external onlyOwner {
        if (_verifier == address(0x0) || bytes(_name).length == 0) {
            revert GubbiRWAT_WrongVerifierData(_verifier, _name);
        }
        verifiersWhiteList[_verifier] = verifierInfo({
            verifierName: _name,
            reputation: 0
        });
    }

    // Verifier must register as verifier of RWA Tokenization
    function setVerifier(uint256 _tokenId) external onlyVerifiers {
        address msgSender = _msgSender();
        if (bytes(verifiersWhiteList[msgSender].verifierName).length == 0) {
            revert GubbiRWAT_AddressIsNotVerifier(msgSender); // Esto detiene la ejecución
        }
        rwaControlData[_tokenId].verifier = msgSender;
    }

    function setUnpausedTokens(uint256 _tokenId) public onlyVerifiers {
        address msgSender = _msgSender();
        if (rwaControlData[_tokenId].verifier != msgSender) {
            revert GubbiRWAT_NotRWAVerifier(_tokenId, msgSender);
        }
        gubbiERC1155.unpauseToken(_tokenId);
    }

    function setAssetStatus(
        uint256 _tokenId,
        AssetTokenizationStatus status
    ) private onlyOwner {
        if (
            status == AssetTokenizationStatus.VERIFIED &&
            rwaControlData[_tokenId].verifier != _msgSender()
        ) {
            revert GubbiRWAT_OnlyVerifierSetVERIFICATION(_tokenId);
        }
        rwaControlData[_tokenId].status = status;
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
