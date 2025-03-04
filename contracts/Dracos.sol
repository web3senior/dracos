// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {LSP8IdentifiableDigitalAsset} from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import {_LSP4_TOKEN_TYPE_TOKEN, _LSP4_TOKEN_TYPE_COLLECTION, _LSP4_METADATA_KEY} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import "./Event.sol";
import "./Error.sol";
import "./Pausable.sol";

/// @title Dracos
/// @author Aratta Labs
/// @notice Dracos contract
/// @dev You will find the deployed contract addresses in the repo
/// @custom:emoji 🐲
/// @custom:security-contact atenyun@gmail.com
contract Dracos is LSP8IdentifiableDigitalAsset("Dracos", "DRA", msg.sender, _LSP4_TOKEN_TYPE_COLLECTION, _LSP4_TOKEN_TYPE_TOKEN), Pausable {
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIdCounter;
    Counters.Counter public _swipeCounter;

    string public constant VERSION = "1.0.0";
    uint256 public constant MAXSUPPLY = 7777;
    uint256 public swipePrice;
    uint256 public mintPrice;
    uint8 public constant LIMIT = 77;
    string failedMessage = "Failed to send Ether!";

    mapping(string => address) public team;
    mapping(address => uint8) public mintPool;
    mapping(bytes32 => uint8) public swipePool;

    // Up to 5 free mint
    mapping(address => uint8) public whitelist;

    constructor() {
        mintPrice = 4 ether;
        swipePrice = 1 ether;

        team["alts"] = 0xc1A411B2F0332C86c90Af22f5367A0265bCB1Df9;
        team["amir"] = 0x188eeC07287D876a23565c3c568cbE0bb1984b83;
        team["dracos"] = 0xe4dAc493FC79373936AAba777b58ED60A8eF5834;

        whitelist[0x0D6CeF9F7bF3A50364ED53989d67d695f71d2857] = 1 * 5;
        whitelist[0x0Ea75f1646073aD4A76C43A3BBCabd6D47Fe738C] = 1 * 5;
        whitelist[0x1C0b106cB4189FaCA9Ab34B6bf5CF86b7979342C] = 1 * 5;
        whitelist[0x2aD8680f5E0129d97a03D2162f4b0c0E89b0E251] = 1 * 5;
        whitelist[0x2CDfa4c1f3a6b4EFFeCD2220599a3736D5614500] = 3 * 5;
        whitelist[0x3F64D9CdD24e9e743B381799714906787a9bF182] = 2 * 5;
        whitelist[0x3feBBa031A3F6326127097250C35Ee1b68c3C777] = 2 * 5;
        whitelist[0x4b727768136116d128CA43018084F487568234EA] = 1 * 5;
        whitelist[0x5c60D171E73b62EE0e25e43994Ab1D6A4F67988e] = 2 * 5;
        whitelist[0x5cB44b4FDFf97E1665b455F778f4929BaA31daa2] = 3 * 5;
        whitelist[0x5F67D10fE5649f4624852C8C27167EE2E08fC1fE] = 5 * 5;
        whitelist[0x6B501c2B4022b3c9d941c743e52b3D037F3bf005] = 1 * 5;
        whitelist[0x6e1188D0c1517efeB4245661Dc418C0E4f8D72ec] = 1 * 5;
        whitelist[0x6f6F6b86b7c5E0c177dF66EA4EFdd1B53aA560E6] = 2 * 5;
        whitelist[0x7Ab1Ad3E60101Bc284E03D36B24515266C97248d] = 2 * 5;
        whitelist[0x7C179BA5b7F81C41f05cF0BE00a0517a8E9e262e] = 1 * 5;
        whitelist[0x8B8B8d8d26971D87090994926609DF706808AeBA] = 2 * 5;
        whitelist[0x9ceeb0a07Cb53A9e2eB5Bf73975F10fe55f48d46] = 1 * 5;
        whitelist[0x29d7c7E4571a83B3eF5C867f75c81D736a9D58aa] = 1 * 5;
        whitelist[0x30bE86726FA54613957D65D7179C87502c71e430] = 1 * 5;
        whitelist[0x74CfCcBe99f65aD33A3B33Df251d86aef939d12a] = 1 * 5;
        whitelist[0x76aB4E3DE3DF4762D57f73373f6C7417a550E10B] = 1 * 5;
        whitelist[0x79B296F1828142572E6c6b984D121E66DFE3Ae2f] = 1 * 5;
        whitelist[0x88d0029D6DCa6c3008d769798319c98fb7a2FA21] = 3 * 5;
        whitelist[0x91f84d5e489CA4c38C87C77743c1685AbF4F6770] = 1 * 5;
        whitelist[0x104bF5FdE03dF2FF3ca0d1485D5A79Ef52998a33] = 1 * 5;
        whitelist[0x310abe89C0351df7c4c9EC17179E4bEc90e8D9eD] = 12 * 5;
        whitelist[0x707Dd5DA74B427625669a00D362fBa16cB9C49b5] = 1 * 5;
        whitelist[0x834e1aeFD9229048c9216F873757B4009d0ecFEB] = 2 * 5;
        whitelist[0x1708ADF7db9A70B41F9F807b9f6b4A951AfF705b] = 1 * 5;
        whitelist[0x1916D7915001dEA6b2996Eb7B3585FCdE0167906] = 1 * 5;
        whitelist[0x4945bD66B3FaA4726F8c88A0553753F701A1F5F7] = 4 * 5;
        whitelist[0x5883Df38904da83B5928415a9b0D53335669F09f] = 2 * 5;
        whitelist[0x8076A2941eBE97a901A682CDAfd4878E4365d490] = 1 * 5;
        whitelist[0x8282c581BBd9071e7E6b3630E322FAC2CDC80F87] = 1 * 5;
        whitelist[0x26526DEbD4Ac8Fcd9592c82970d5aC1e53a663d9] = 1 * 5;
        whitelist[0x063952C9a5f9517C49f0541db35EBB8520DE1cBC] = 1 * 5;
        whitelist[0x66259dcd43029182571949ee0d606592872bFD7D] = 1 * 5;
        whitelist[0x092216B445B6c64594b4Eb8e3FA1AE2790fe1ABE] = 1 * 5;
        whitelist[0x241602DBeb54F33C410Ab4A9269D9F9CD882FbF0] = 1 * 5;
        whitelist[0x02203544096B5ff75bE0A62B1C5a1a96eAC936e5] = 1 * 5;
        whitelist[0x9797953494aD45Dd40195C6416b289787DB9ABE6] = 1 * 5;
        whitelist[0x78047804962943E96e6c6371FE5BB8310c381Eb6] = 1 * 5;
        whitelist[0xae0D6988d8C26CB54315D8D40dbCC86542fDb076] = 1 * 5;
        whitelist[0xb350138377adEA9C5Fc34cf15eA7CBeca6B62116] = 1 * 5;
        whitelist[0xBF8b247c08A3ACE0311044DE539025E6b565aE09] = 1 * 5;
        whitelist[0xc53B79d42a55BA03767bFb1ab446b813280C6d86] = 1 * 5;
        whitelist[0xCDeC110F9c255357E37f46CD2687be1f7E9B02F7] = 1 * 5;
        whitelist[0xD5c09C0e190bA7AE151CEE8cb7c6df059BF2e06c] = 1 * 5;
        whitelist[0xd8744E1C6B2f9e49C54dEe14f9a51e202e121228] = 2 * 5;
        whitelist[0xd72251143cbcb6FEe8295Dec34633231497C1111] = 2 * 5;
        whitelist[0xe100b05Dc141EB1E13DF381A9Da4e725b3cC0656] = 1 * 5;
        whitelist[0xe11999eCae4C2Cd5E719577f71fAE32D5f6BC4d0] = 1 * 5;
        whitelist[0xeb4158275D2Ba76FF118D3b3cAa1DEe78e47D235] = 1 * 5;
        whitelist[0xF76eF9e28aC9c7dbb89729e2F52d810B643B1576] = 1 * 5;
        whitelist[0xf269a00d8Cf862dDb881256D5F3292B4d91ff691] = 1 * 5;
        whitelist[0xFA00bA127034fE1c4962e93AA845d6cc902604DE] = 1 * 5;
    }

    function updateSwipePrice(uint256 amount) public onlyOwner {
        assert(amount < 100);
        swipePrice = amount;
        emit SwipePriceUpdated(amount, _msgSender());
    }

    function updateMintPrice(uint256 amount) public onlyOwner {
        mintPrice = amount;
        emit MintPriceUpdated(amount, _msgSender());
    }

    /// @notice Create verifiable metadata for the LSP8 standard
    function getMetadata(string memory metadata) public pure returns (bytes memory) {
        bytes memory verfiableURI = bytes.concat(hex"00006f357c6a0020", keccak256(bytes(metadata)), abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(metadata))));
        return verfiableURI;
    }

    function updateTeam(string memory key, address addr) public onlyOwner {
        team[key] = addr;
        emit TeamUpdated(key, addr);
    }

    function updateWhitelist(address addr, uint8 count) public onlyOwner {
        whitelist[addr] = count;
    }

    function getWhitelist(address addr) public view returns (uint8) {
        return whitelist[addr];
    }

    function transferFund(uint256 amount) internal {
        (bool success1, ) = team["alts"].call{value: calcPercentage(amount, 25)}("");
        require(success1, failedMessage);

        (bool success2, ) = team["amir"].call{value: calcPercentage(amount, 25)}("");
        require(success2, failedMessage);

        (bool success3, ) = team["dracos"].call{value: calcPercentage(amount, 50)}("");
        require(success3, failedMessage);
    }

    function handleMint(string memory metadata) public payable whenNotPaused returns (bool) {
        require(MAXSUPPLY > totalSupply(), "Max supply exceeded.");
        require(LIMIT > mintPool[_msgSender()], "Limitation per wallet exceeded.");

        if (mintPrice > 0) {
            if (whitelist[_msgSender()] < 1) {
                if (msg.value < mintPrice) revert InsufficientBalance(msg.value);
                transferFund(msg.value);
            } else {
                // Delete user from whitelist pool
                whitelist[_msgSender()] = whitelist[_msgSender()] - 1;
            }
        }

        _tokenIdCounter.increment();
        bytes32 newTokenId = bytes32(_tokenIdCounter.current());
        _mint({to: _msgSender(), tokenId: newTokenId, force: true, data: ""});

        _setDataForTokenId(newTokenId, _LSP4_METADATA_KEY, getMetadata(metadata));

        mintPool[_msgSender()] = mintPool[_msgSender()] + 1;

        return true;
    }

    function handleSwipe(bytes32 tokenId, string memory metadata) public payable whenNotPaused returns (bool) {
        // Can't swipe if max supply exceeded
        require(MAXSUPPLY > totalSupply(), "Max supply exceeded.");
        require(swipePool[tokenId] < 4, "Swipe limit has been exceeded");

        if (swipePrice > 0) {
            if (msg.value < swipePrice) revert InsufficientBalance(msg.value);
            transferFund(msg.value);
        }

        _swipeCounter.increment();
        _setDataForTokenId(tokenId, _LSP4_METADATA_KEY, getMetadata(metadata));

        swipePool[tokenId] += 1;

        return true;
    }

    ///@notice calcPercentage percentage
    ///@param _amount The total amount
    ///@param _bps The precentage
    ///@return percentage %
    function calcPercentage(uint256 _amount, uint256 _bps) private pure returns (uint256) {
        require((_amount * _bps) >= 100);
        return (_amount * _bps) / 100;
    }

    ///@notice Withdraw the balance from this contract to the owner's address
    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Failed");
    }

    ///@notice Transfer balance from this contract to input address
    function transferBalance(address payable _to, uint256 _amount) public onlyOwner {
        // Note that "to" is declared as payable
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Failed");
    }

    /// @notice Return the balance of this contract
    function getBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    /// @notice Pause mint
    function pause() public onlyOwner {
        _pause();
    }

    /// @notice Unpause mint
    function unpause() public onlyOwner {
        _unpause();
    }
}
