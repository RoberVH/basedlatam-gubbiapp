// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
//import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
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
    address public constant BASE_SEPOLIA_ERC20 = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;  // reference from CIRCLE ( https://www.circle.com/en/multi-chain-usdc/base )


    uint256 constant MAX_INTEREST = 100000000; // Max Interest to ask for in a tokenization

    error GubbiRWAT_InterestRateExceedsLimit(
        uint256 providedRate,
        uint256 maxRate
    );
    error GubbiRWAT_AddressIsNotVerifier(address verifier);
    error GubbiRWAT_WrongRWAVerifier(uint256 tokenId, address _verifier);
    error GubbiRWAT_WrongVerifierData(address _verfier, string _name);
    error GubbiRWAT_NotRWAVerifier(uint256 _token, address _verifier);
    error GubbiRWAT_AlreadyExistsRWAVerifier(address _existingVerifier, address _pretendedVerifier);
    error GubbiRWAT_NotYourRWA(uint256 _tokenId);
    error GubbiRWAT_CannotModifyafterVerified(uint256 _tokenId);
    error GubbiRWAT_CannotCancelNow(uint256 _tokenId);
    error GubbiRWAT_InvalidPrice(uint256 _newPrice);
    error GubbiRWAT_RWAnotVerified(uint256 _newPrice);
    error GubbiRWAT_AmountTokensWrong( uint256 _amountTokens);
    error GubbiRWAT_WrongPayment(uint256 _value);
    error GubbiRWAT_NotEnoughBalancetoSell(uint256 _balance, uint256 _wantedAmount);
    error GubbiRWAT_NotListed(uint256 _tokenId);
    error GubbiRWAT_GubbiTokensTransferFailed(uint _tokenId, address _seller, address _buyer);
    error GubbiRWAT_NotExpiredYet(uint _tokenId, uint256 _expirationDate);
    error GubbiRWAT_NotTokenHolder(uint _tokenId, address sender);
    error GubbiRWAT_NotRepaidYet(uint _tokenId);

    enum AssetTokenizationStatus {
        CREATED,        // Seller creates a RWA
        VERIFIED,       // Seller and Verifier have agreed on paramters of RWA and seller list the RWA for sale
        LISTED,         // the RWA is available for buying
        SOLD_OUT,       // all the tokens have been sold
        MATURED,        // The period of maturation has come and RWA is available to be repaid
        PAYOFF,         // Seller has repayed loan
        LIQUIDATION,    // Seller failed to paid and seizure of assets is being conducted
        CANCELED
    }

    // RWA tokenizatiion Data control struct
    struct tokenMetadata {
        uint256 tokenId;
        uint256 issuedTokens;           // number of tokens issued, must be up to a 65% of totalPrice of asset
        uint256 totalPrice;             // total price of Real Wordl Asset that is validated by Verifier
        address issuer;                 // account owner of the RWA
        AssetTokenizationStatus status; // life cicle RWA Tokenization stage flags
        address verifier;               // Address of Agent/Embassador/Broker recognized by Gubbi as a valir person to supervized RWA
        uint256 maturityPeriod;         // time from sold out day to repayment commitment
        uint256 soldOutDay;             // day when funds are released to seller, starts maturity period
        uint256 listedDay;              // Starting day of sales period
        //uint presalsePeriod;          // period seller and buyers can check to see if sales is soldOut, after the period seller  (for next version)
        uint256 interest;               // 8 decimals interes rate. Ejemplos de interest
        // 100% = 100 * 1e6
        //   5% = 0.05 * 1e6 = 50000
        //   3% = 0.03 * 1e6 = 30000 etc
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
    IERC20 usdc = IERC20(BASE_SEPOLIA_ERC20);
    ERC1155Gubbi private gubbiERC1155;

    event rwaCreatedEvent(uint256 indexed tokenId, uint256 amount, address indexed owner);

    event rwaListed(uint256 indexed _tokenId, uint256 indexed _listedDay );

    event verifierRevoke(address indexed _verifier, address indexed _admin );

    event soldOutRWA(uint256 _tokenId, uint256 soldoutday);

    event rwaMatured(uint256 _tokenId,  uint256 matureDate);

    event rwaRepaid(uint256 _tokenId, uint256 repaidDate);

    

    modifier onlyIssuerBeforeVerification(uint256 _tokenId) {
        if (msg.sender != rwaControlData[_tokenId].issuer) {
            revert GubbiRWAT_NotYourRWA(_tokenId);
        }
        if (rwaControlData[_tokenId].status != AssetTokenizationStatus.CREATED) {
            revert GubbiRWAT_CannotModifyafterVerified(_tokenId);
        }
        _;
    }

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
        uint256 _amountTokens,      // number of tokens issued, must be up to a 65% of totalPrice of asset
        uint256 _totalPrice,        // total price of Real Wordl Asset that is validated by Verifier
        uint256 _interest,           // Each token is repaid at (_totalPrice / _amountTokens) * ( 1 + _interest)
        uint256 _maturityPeriod     // time from sold-out to seller's commitment to repay
    ) external {
        if (_interest > MAX_INTEREST) {
            revert GubbiRWAT_InterestRateExceedsLimit(_interest, MAX_INTEREST);
        }
        if (_amountTokens ==0) {
            revert GubbiRWAT_AmountTokensWrong(_amountTokens);
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
            issuedTokens: _amountTokens,
            totalPrice: _totalPrice,
            issuer: sender,
            status: AssetTokenizationStatus.CREATED,
            verifier: address(0),
            interest: _interest,
            maturityPeriod: _maturityPeriod,     // time from SOLD_OUT to seller's commitment to repay
            soldOutDay: 0,                       // will be set by contract when releasing funds 
            listedDay: 0                       // will be set by contract when listing day
        });
        gubbiERC1155.pauseToken(s_tokenIdCount);
        emit rwaCreatedEvent(s_tokenIdCount, _amountTokens, sender);
        s_tokenIdCount++;
    }

    // Allow RWA offering
    function listRWA(uint256 _tokenId) external {
        if (rwaControlData[_tokenId].status!= AssetTokenizationStatus.VERIFIED) {
            revert GubbiRWAT_RWAnotVerified(_tokenId);
        }
        rwaControlData[_tokenId].status = AssetTokenizationStatus.LISTED;
        rwaControlData[_tokenId].listedDay = block.timestamp;
        emit rwaListed(_tokenId, block.timestamp);
    }


    // allow users to buy tokens
    // Buyer must approve contract GubbiRWATokenization to move the tokens
    function buyRWATokens(uint256 _tokenId, uint256 _buyingAmount) external payable {
        // each tokens costs 1 USDC

        tokenMetadata memory metadata  = rwaControlData[_tokenId];
        if (metadata.status != AssetTokenizationStatus.LISTED) {
            revert GubbiRWAT_NotListed(_tokenId);
        }
        uint256 tokenBalance = gubbiERC1155.balanceOf(metadata.issuer, _tokenId);
        if ( tokenBalance < _buyingAmount) {
            revert GubbiRWAT_NotEnoughBalancetoSell( tokenBalance, _buyingAmount);
        }
        uint256 availableBalance = usdc.allowance(msg.sender, address(this));
        if (availableBalance < _buyingAmount ) {
            revert GubbiRWAT_WrongPayment(availableBalance);
        }
        // get the payment USDC tokens from buyer to contract Gubbi
        require(usdc.transferFrom(msg.sender, address(this), _buyingAmount), "Payment Transfer failed");
        // send the rwa tokens to buyer
        try gubbiERC1155.safeTransferFrom(
                metadata.issuer, 
                msg.sender, 
                _tokenId, 
                _buyingAmount, 
                ""                  //  Este transfer falla por ERC1155Gubi_TokenNotActive(0),  deberia poder cachar este error, investigar
        )   {   
            //usdc.transferFrom(msg.sender,  address(this), _buyingAmount);
            // check how many tokens left for selling of the token
            tokenBalance = gubbiERC1155.balanceOf(metadata.issuer, _tokenId);
            if (tokenBalance == 0) {
                // Soldout!!! - transfer usdc from contract to seller, commence maturity period
                uint256 usdcGubbiBal = usdc.balanceOf(address(this));
                require(  metadata.issuedTokens <= usdcGubbiBal,"No hay balance suficiente");
                require(usdc.transfer( metadata.issuer, metadata.issuedTokens), "Transfer failed");
                rwaControlData[_tokenId].status = AssetTokenizationStatus.SOLD_OUT;
                rwaControlData[_tokenId].soldOutDay = block.timestamp;
                emit soldOutRWA(_tokenId, block.timestamp);
            }
        }  catch (bytes memory lowLevelData) {
            usdc.transfer(msg.sender, _buyingAmount);  // Return from contract GubbiRWA to msg.sender what was transfered before as we failed to transfer the bought tokens
    
            if (bytes4(lowLevelData) == bytes4(keccak256("ERC1155Gubi_TokenNotActive(uint256)"))) {
                revert ERC1155Gubbi.ERC1155Gubi_TokenNotActive(_tokenId);
            }
            // some other unkown error
            revert GubbiRWAT_GubbiTokensTransferFailed(_tokenId, metadata.issuer, msg.sender);
        }
    }
    // Matured date has arrived and seller send payment plus interest to the contract closing the cicle and setting status to MATURED
    function repaidTokens(uint56 _tokenId) external {
        // calculate repayment
        tokenMetadata memory metadata  = rwaControlData[_tokenId];
        uint256 totalRepayment = (metadata.issuedTokens * (1e6 + metadata.interest)) / 1e6;
        require(usdc.transferFrom(msg.sender, address(this), totalRepayment), "RePayment Transfer failed");
        rwaControlData[_tokenId].status=AssetTokenizationStatus.PAYOFF;
        emit rwaRepaid(_tokenId,block.timestamp);
    }
    
    // Payment period. token holders can invoke this function to retrieve their payments once the maturity has been reached
    function callRWADefault(uint256 _tokenId) external {
        tokenMetadata memory metadata  = rwaControlData[_tokenId];
        uint256 expirationDate = metadata.listedDay + metadata.maturityPeriod;
        if (block.timestamp < expirationDate) {
            revert GubbiRWAT_NotExpiredYet(_tokenId, expirationDate);
        }
        rwaControlData[_tokenId].status =  AssetTokenizationStatus.MATURED;
        emit rwaMatured(_tokenId,  block.timestamp);
    }

    // Creditors redeem their tokens 
    function tokensRedemption(uint256 _tokenId) external {
        tokenMetadata memory metadata  = rwaControlData[_tokenId];
        uint256 dueBalance= gubbiERC1155.balanceOf(msg.sender, _tokenId);
        if (dueBalance == 0) {
            revert GubbiRWAT_NotTokenHolder(_tokenId, msg.sender);
        }
        if (metadata.status!= AssetTokenizationStatus.PAYOFF) {
            revert  GubbiRWAT_NotRepaidYet(_tokenId);
        }
        uint tokenstoRedeemplusinteres = (dueBalance * ( 1e6 + metadata.interest)) / 1e6;
        require(usdc.transfer(msg.sender, tokenstoRedeemplusinteres), "Transfer failed");
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
        tokenMetadata memory metadata = rwaControlData[_tokenId];
        if (metadata.verifier!=address(0)) {
            revert GubbiRWAT_AlreadyExistsRWAVerifier(metadata.verifier, msg.sender);
        }
        rwaControlData[_tokenId].verifier = msg.sender;
    }



    function setPrice(uint256 _tokenId, uint256 _newPrice) external onlyIssuerBeforeVerification(_tokenId) {
            if(_newPrice == 0) { 
            revert GubbiRWAT_InvalidPrice(_newPrice);
            }
            rwaControlData[_tokenId].totalPrice = _newPrice;
        }

    function setInterest(uint256 _tokenId, uint256 _interest) external onlyIssuerBeforeVerification(_tokenId)
        {
            if (_interest > MAX_INTEREST) {
                revert GubbiRWAT_InterestRateExceedsLimit(_interest, MAX_INTEREST);
            }
            rwaControlData[_tokenId].interest = _interest;
        }

    function setMaturityPeriod(uint256 _tokenId, uint256 _maturityPeriod) external onlyIssuerBeforeVerification(_tokenId)
        {
            rwaControlData[_tokenId].maturityPeriod = _maturityPeriod;
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

    function setCancelRWA(uint _tokenId) external onlyIssuerBeforeVerification(_tokenId) {
        tokenMetadata storage metadata =  rwaControlData[_tokenId];
        metadata.status = AssetTokenizationStatus.CANCELED;
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
            revert GubbiRWAT_WrongRWAVerifier(_tokenId, msg.sender);
        }
        rwaControlData[_tokenId].status=AssetTokenizationStatus.VERIFIED;
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
