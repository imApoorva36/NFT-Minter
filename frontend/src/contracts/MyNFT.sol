// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
// Import necessary libraries
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;  

    uint256 public maxSupply = 3000;
    string private _baseTokenURI;
    mapping(uint256 => string) private _tokenURIs;

    constructor(string memory name, string memory symbol, string memory baseTokenURI) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function mintWithURI(string memory imageURI) public onlyOwner {
        require(totalSupply() < maxSupply, "Max supply reached");
        uint256 tokenId = totalSupply() + 1;
        _mint(msg.sender, tokenId);
        _tokenURIs[tokenId] = imageURI;
    }

    function updateTokenURI(uint256 tokenId, string memory newImageURI) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _tokenURIs[tokenId] = newImageURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, _tokenURIs[tokenId])) : "";
    }
}
