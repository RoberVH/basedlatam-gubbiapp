// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC1155Supply, ERC1155} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import { ERC1155Gubbi } from "./ERC1155Gubbi.sol";

/**
 * GubbiRWATokenization.sol
 *      Applies Gubbi rules and  logic to ERC1155 inherited contractsfor RWA  Tokenization
 */
    contract GubbiRWATokenization is ERC1155Gubbi {
 
    uint256 constant MAX_INTEREST = 100000000;         // Max Interest to ask for in a tokenization

    uint256 private s_tokenIdCount=0;

    enum AssetTokenizationStatus  {
        CREATED,
        VERIFIED,
        MATURING,
        FULFILLED,
        CANCELED
     }

    // RWA tokenizatiion Data control struct
    struct tokenMetadata{
        address issuer;                         // account owner of the RWA
        AssetTokenizationStatus  status;        // life cicle rwa Tokenization stage flags
        address verifier;                       // Address of Agent/Embassador/Broker recognized by Gubbi as a valir person to supervized RWA
        uint256 interest;                        // 8 decimals interes rate. Ejemplos de interest::
                                                                                        // 100% = 100000000
                                                                                        //   5% = 5000000
                                                                                        //   3% = 3000000
    }

    // Verfier information data
    struct verifierInfo {
        string verifierName;
        uint8 reputation;           // points Verifier has won
    }


    // Gubbi-approve Verifier white-list
    mapping( address verifierAddress => verifierInfo) public verifiersWhiteList;

    // tokenId data Control information
    mapping(uint256 tokenId =>  tokenMetadata)  rwaControlData;

    // whitelist of verifiers

    // Optional mapping for token URIs
    mapping(uint256 tokenId => string) private _tokenURIs;

    event rwaCreatedEvent(uint256 indexed tokenId, uint256 amount, address indexed owner);

    error InterestRateExceedsLimit(uint256 providedRate, uint256 maxRate);
    error AddressIsNotVerifier(address verifier);
    error OnlyVerifierSetVERIFICATION(uint256 tokenId);


    constructor(string memory uri_) ERC1155Gubbi(uri_) {}

    function mintRWATokenization(uint256 _amountTokens, uint256 _interest ) public {
           if (_interest > MAX_INTEREST) {
            revert InterestRateExceedsLimit(_interest, MAX_INTEREST);
        }
        mint(address(this), s_tokenIdCount, _amountTokens, "", "");
        rwaControlData[s_tokenIdCount] = tokenMetadata({
            issuer: _msgSender(),
            status: AssetTokenizationStatus.CREATED,
            verifier: address(0),
            interest: _interest
        });
        emit rwaCreatedEvent(s_tokenIdCount,  _amountTokens, _msgSender());
        s_tokenIdCount++;
    }

// Setters ****************************************************************************

    
    // Verifier must register as verifier of RWA Tokenization
    function setRWAVerifier(uint256 _tokenId) private onlyOwner  {
        address msgSender=_msgSender();
        if (bytes(verifiersWhiteList[msgSender].verifierName).length == 0) {
            revert AddressIsNotVerifier(msgSender);
        }
        rwaControlData[_tokenId].verifier = msgSender;
    }
    
    function setAssetStatus(uint256 _tokenId, AssetTokenizationStatus  status) private onlyOwner {
        if (status == AssetTokenizationStatus.VERIFIED && rwaControlData[_tokenId].verifier != _msgSender()) {
                revert OnlyVerifierSetVERIFICATION(_tokenId);
        }
        rwaControlData[_tokenId].status = status;
    }



// getters  ****************************************************************************

    function getAssetStatus(uint256 _tokenId) public view returns (AssetTokenizationStatus ) {
        return rwaControlData[_tokenId].status;
    }

    function getRWAControlData(uint256 _tokenId) public view returns (tokenMetadata memory) {
        return rwaControlData[_tokenId];
    }
    

}
