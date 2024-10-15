// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC1155Supply, ERC1155} from '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol';
import {OwnerIsCreator} from '@chainlink/contracts/src/v0.8/shared/access/OwnerIsCreator.sol';

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

/**
 * @title
 * @dev  OwnerisCreator Constructor  allows to call it with 2 params:
 * @author
 * @notice
 */
contract ERC1155Gubbi is ERC1155Supply, OwnerIsCreator {
    
    error ERC1155Gubi_CallerIsNotIssuer(address msgSender);
    error ERC1155Gubi_TokenNotActive(uint256 tokenId);

    //  mapping for token URIs
    mapping(uint256 tokenId => string) private _tokenURIs;
    mapping(uint256 => bool) private _pausedTokens; 


    address internal s_issuer; 

    modifier onlyIssuer() {
        if (_msgSender() != s_issuer) {
            revert ERC1155Gubi_CallerIsNotIssuer(_msgSender());
        }
        _;
    }

    event SetIssuer(address indexed issuer);

    // Used as the URI for all token types by relying on ID substitution, e.g. https://token-cdn-domain/{id}.json
    constructor() ERC1155("") OwnerIsCreator() {
    }


    function pauseToken(uint256 tokenId) external onlyIssuer {
        _pausedTokens[tokenId] = true;
    }

    // Función para reanudar un token específico
    function unpauseToken(uint256 tokenId) external onlyIssuer {
        _pausedTokens[tokenId] = false;
    }    

    function getIssuer() public view returns (address) {
        return s_issuer;
    }

    function setIssuer(address _issuer) external onlyOwner {
        s_issuer = _issuer;

        emit SetIssuer(_issuer);
    }
 
    function mint(
        address _to,
        uint256 _id,
        uint256 _amount,
        bytes memory _data,
        string memory _tokenUri
    ) external onlyIssuer {
        _mint(_to, _id, _amount, _data);
        _tokenURIs[_id] = _tokenUri;
    }

 function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public  override {
        if (_pausedTokens[id]) {
            revert ERC1155Gubi_TokenNotActive(id);

        }
        super.safeTransferFrom(from, to, id, amount, data);
    }

    function burn(
        address account,
        uint256 id,
        uint256 amount
    ) external onlyIssuer {
        if (
            account != _msgSender() && !isApprovedForAll(account, _msgSender())
        ) {
            revert ERC1155MissingApprovalForAll(_msgSender(), account);
        }

        _burn(account, id, amount);
    }

    function burnBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public onlyIssuer {
        if (
            account != _msgSender() && !isApprovedForAll(account, _msgSender())
        ) {
            revert ERC1155MissingApprovalForAll(_msgSender(), account);
        }

        _burnBatch(account, ids, amounts);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];

        return bytes(tokenURI).length > 0 ? tokenURI : super.uri(tokenId);
    }

    function _setURI(uint256 tokenId, string memory tokenURI) internal onlyOwner {
        _tokenURIs[tokenId] = tokenURI;
        emit URI(uri(tokenId), tokenId);
    }
}
