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
/// @notice A contract for managing the Dracos NFT collection, enabling minting, swiping, and distribution.
/// @dev Deployed contract addresses are available in the project repository.
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
    uint8 public constant WHITELIST_MINT_AMOUNT = 5;
    uint8 public constant SWIPE_LIMIT = 3;
    string failedMessage = "Failed to send Ether!";

    mapping(string => address) public team;
    mapping(address => uint8) public mintPool;
    mapping(bytes32 => uint8) public swipePool;

    // Up to 5 free mint
    mapping(address => uint8) public whitelist;

    constructor() {
        mintPrice = 4 ether;
        swipePrice = 1 ether;

        team["alts"] = 0x15E597eA255e9DD1De9c08969DaA875962e2621c;
        team["amir"] = 0x0D5C8B7cC12eD8486E1E0147CC0c3395739F138d;
        team["dracos"] = 0x8A985fe01eA908F5697975332260553c454f8F77;

        // Metaheads
        whitelist[0x0D6CeF9F7bF3A50364ED53989d67d695f71d2857] = (1 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0x0Ea75f1646073aD4A76C43A3BBCabd6D47Fe738C] = (1 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0x1C0b106cB4189FaCA9Ab34B6bf5CF86b7979342C] = (1 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0x2aD8680f5E0129d97a03D2162f4b0c0E89b0E251] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x2CDfa4c1f3a6b4EFFeCD2220599a3736D5614500] = (3 * WHITELIST_MINT_AMOUNT) + 2;
        whitelist[0x3F64D9CdD24e9e743B381799714906787a9bF182] = (2 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x3feBBa031A3F6326127097250C35Ee1b68c3C777] = (2 * WHITELIST_MINT_AMOUNT) + 2;
        whitelist[0x4b727768136116d128CA43018084F487568234EA] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x5c60D171E73b62EE0e25e43994Ab1D6A4F67988e] = (2 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0x5cB44b4FDFf97E1665b455F778f4929BaA31daa2] = (3 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x5F67D10fE5649f4624852C8C27167EE2E08fC1fE] = (5 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0x6B501c2B4022b3c9d941c743e52b3D037F3bf005] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x6e1188D0c1517efeB4245661Dc418C0E4f8D72ec] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x6f6F6b86b7c5E0c177dF66EA4EFdd1B53aA560E6] = (2 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x7Ab1Ad3E60101Bc284E03D36B24515266C97248d] = (2 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x7C179BA5b7F81C41f05cF0BE00a0517a8E9e262e] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x8B8B8d8d26971D87090994926609DF706808AeBA] = (2 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x9ceeb0a07Cb53A9e2eB5Bf73975F10fe55f48d46] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x29d7c7E4571a83B3eF5C867f75c81D736a9D58aa] = (1 * WHITELIST_MINT_AMOUNT) + 2;
        whitelist[0x30bE86726FA54613957D65D7179C87502c71e430] = (1 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0x74CfCcBe99f65aD33A3B33Df251d86aef939d12a] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x76aB4E3DE3DF4762D57f73373f6C7417a550E10B] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x79B296F1828142572E6c6b984D121E66DFE3Ae2f] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x88d0029D6DCa6c3008d769798319c98fb7a2FA21] = (3 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x91f84d5e489CA4c38C87C77743c1685AbF4F6770] = (1 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0x104bF5FdE03dF2FF3ca0d1485D5A79Ef52998a33] = (1 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0x310abe89C0351df7c4c9EC17179E4bEc90e8D9eD] = (12 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0x707Dd5DA74B427625669a00D362fBa16cB9C49b5] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x834e1aeFD9229048c9216F873757B4009d0ecFEB] = (2 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x1708ADF7db9A70B41F9F807b9f6b4A951AfF705b] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x1916D7915001dEA6b2996Eb7B3585FCdE0167906] = (1 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0x4945bD66B3FaA4726F8c88A0553753F701A1F5F7] = (4 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x5883Df38904da83B5928415a9b0D53335669F09f] = (2 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x8076A2941eBE97a901A682CDAfd4878E4365d490] = (1 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0x8282c581BBd9071e7E6b3630E322FAC2CDC80F87] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x26526DEbD4Ac8Fcd9592c82970d5aC1e53a663d9] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x063952C9a5f9517C49f0541db35EBB8520DE1cBC] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x66259dcd43029182571949ee0d606592872bFD7D] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x092216B445B6c64594b4Eb8e3FA1AE2790fe1ABE] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x241602DBeb54F33C410Ab4A9269D9F9CD882FbF0] = (1 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0x02203544096B5ff75bE0A62B1C5a1a96eAC936e5] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0x9797953494aD45Dd40195C6416b289787DB9ABE6] = (1 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0x78047804962943E96e6c6371FE5BB8310c381Eb6] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0xae0D6988d8C26CB54315D8D40dbCC86542fDb076] = (1 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0xb350138377adEA9C5Fc34cf15eA7CBeca6B62116] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0xBF8b247c08A3ACE0311044DE539025E6b565aE09] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0xc53B79d42a55BA03767bFb1ab446b813280C6d86] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0xCDeC110F9c255357E37f46CD2687be1f7E9B02F7] = (1 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0xD5c09C0e190bA7AE151CEE8cb7c6df059BF2e06c] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0xd8744E1C6B2f9e49C54dEe14f9a51e202e121228] = (2 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0xd72251143cbcb6FEe8295Dec34633231497C1111] = (2 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0xe100b05Dc141EB1E13DF381A9Da4e725b3cC0656] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0xe11999eCae4C2Cd5E719577f71fAE32D5f6BC4d0] = (1 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0xeb4158275D2Ba76FF118D3b3cAa1DEe78e47D235] = (1 * WHITELIST_MINT_AMOUNT) + 0;
        whitelist[0xF76eF9e28aC9c7dbb89729e2F52d810B643B1576] = (1 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0xf269a00d8Cf862dDb881256D5F3292B4d91ff691] = (1 * WHITELIST_MINT_AMOUNT) + 1;
        whitelist[0xFA00bA127034fE1c4962e93AA845d6cc902604DE] = (1 * WHITELIST_MINT_AMOUNT) + 2;
        whitelist[0xAd39ffbD42AB449ADCEEDB83e4Dfb4c238d5eaBD] = (2 * WHITELIST_MINT_AMOUNT) + 1;

        // Arcane Pix & PXYLS
        whitelist[0x7BFbcAF9384B43a21287D419B2b347AB44895677] = 1;
        whitelist[0x2E1671Cd882f25AC8395566edc2b6a3157d4958a] = 1;
        whitelist[0xCC5A2636362604aaC20dc1ac82abDFF3948d6A20] = 1;
        whitelist[0x639A85586B93DFD82AF239e644aCD2BE7527d159] = 1;
        whitelist[0x86c4F746676c32E0167485199998FA5230099b70] = 2;
        whitelist[0xAE625125C4fa87ac9566ADCd3E02d5af21b71183] = 2;
        whitelist[0xaD1ffA5568C6242f23A30732303A2D88acbd64d2] = 1;
        whitelist[0x4dCf320D483d5F5c527fF7A455AA59AF31a4e84A] = 1;
        whitelist[0x128a62e75EA799c38c05A276f6150f6C53A8CC0d] = 1;
        whitelist[0xed4C3FD3762dAFbdf184210ec2D70d2497D675B8] = 2;
        whitelist[0xAAE90E0000eC70ccC71De79130c563784360F60B] = 1;
        whitelist[0x6ED59C8A1068b37Da60Ab0bBed3e49936e99F9bf] = 2;
        whitelist[0xb0F3F6D843290Ab2B55B4FA38cf5011CC00F68b7] = 1;
        whitelist[0xd00D248970db3FEe8ae86008A9f78453dd61D3A0] = 1;
        whitelist[0x234c8fcd41D02B104B8E3D9776A11e1b39DfD1b0] = 3;
        whitelist[0x218F77FC44a3e36aee96438a461F0eb9e590E356] = 1;
        whitelist[0x3D6F6E59B62187BaEA11f6a424FBfF7C535F00D7] = 2;
        whitelist[0x1d7b8B2512E01E27d8656D98817d1F01550C28BD] = 1;
        whitelist[0x37502A753EA697fBDf5402718c2F83443e4569B3] = 2;
        whitelist[0x33B4BE0F38531e83fDe58C1EF96715af03B1b38c] = 1;
        whitelist[0x46449e7d22fB09e3cb295B996Ba3a8C96FF27075] = 2;
        whitelist[0x4AB2Baae32baDeDA0B70C06e8316df67E252CaEc] = 1;
        whitelist[0x1c02B51C435b3F1336eAAb3C4eFA5cB75A49976a] = 1;
        whitelist[0x0D5C8B7cC12eD8486E1E0147CC0c3395739F138d] = 1;
        whitelist[0x3305a691A7a3B03de05E0d1082f7cd09CDFbFDC2] = 1;
        whitelist[0x188add574bAF734E074d8996494F9998ca67081D] = 2;
        whitelist[0x64318CDdF0F87DBa45BE181584c54Ae955ABF2D2] = 1;
        whitelist[0x8CABB08C1c00012731aaAfddd480B85bc8478b91] = 3;
        whitelist[0x0000d4659E5B1Da00C48b9D15Cf2aABA5A0f7Ece] = 1;
        whitelist[0xa08AaC599A4167351A50C5745490FEeA7dEeB484] = 1;
        whitelist[0xA1d2d25Ae200e428f48ccEd548a7644312FD7C8A] = 4;
        whitelist[0xA21add2BEdB3bCDAD9497166AA8390BC3b72E80e] = 1;
        whitelist[0xA371Dd665b795a252Be0084779570164614BBB40] = 1;
        whitelist[0xc860d91862D7edA63576a67580cbb3F6063C340F] = 1;
        whitelist[0xce80C4C26aCd83b6a9B327cEd71F562Cd1996D19] = 1;
        whitelist[0xCF051a15650b658af14b6186B42e36cd593a6069] = 2;
        whitelist[0xD2C4796c546c253Cd34E545606DC4aD72A3377AC] = 1;
        whitelist[0xd3402b28bCeFA537F1B488D3548BBFaDd6439d4d] = 1;
        whitelist[0xdE0Da643334b4f0722f45baA9b1f7B7C71C82976] = 1;
        whitelist[0xe20b36A2F074b9F697ECBe70BF7491C4d8E0116e] = 1;
        whitelist[0xE24a6DFc0b14d26402b873F54a2C7619e63C8787] = 1;
        whitelist[0xf3696Fe16f3d7c1932CEAf1D3c33A32aEf3037B8] = 1;
        whitelist[0xF740391144CF5CdC65e2e520808575c023516970] = 1;
        whitelist[0x9C8d8d69f00b72cDA46e686118D1aD2B4E9f14BB] = 1;
        whitelist[0x041B2744fB8433Fc8165036d30072c514390271e] = 1;
        whitelist[0x12d41E75F9D78e07Cf526c5B2a207db0EaF8eAC6] = 1;
        whitelist[0x1339dA99019bE50746E045a7D1163c038a3f2770] = 1;
        whitelist[0x26e7Da1968cfC61FB8aB2Aad039b5A083b9De21e] = 1;
        whitelist[0xa5118f0524c14EF9BFB7CeEC73D5CBDC2838DFe0] = 1;
        whitelist[0x3702a7be7EA8fF7f12D4078B6fF9828898bFAd97] = 1;
        whitelist[0x07773064C59E67076a0A88ad52E9F6d8d9424f02] = 1;
        whitelist[0xFb4CCeCAda3364F3B32C9d515D7F5340811A29B8] = 1;
        whitelist[0x0EbaAd47495ccEd794F2f7b4BeAD3Ad83dA138eD] = 1;
        whitelist[0x7960B3c8761E587dDE32be4F42882E5eee49CC44] = 1;
        whitelist[0x46731b263B896a7FEb691740Cb1b6f5f2a91EAbd] = 1;
        whitelist[0x33FAEf0e4e7ef198D4dc4D2866E55AC33b687404] = 1;
        whitelist[0xe1Bf1d1E93A505ba2a3447d732CcfA1E99CB47D9] = 1;
        whitelist[0xa80646568f483578a572C89fBbCc47528F16e444] = 1;
        whitelist[0x7C9E5aC911b9415a1FD091975E0BA96fe3e62001] = 1;
        whitelist[0xdF869Fe30f4714EAf7D518181266517753e0731F] = 1;
        whitelist[0x2a5491B937894d7539C3b757A51c6bbA00E891ea] = 1;
        whitelist[0x926B7d49D58983C43c2ee2801432EEa0fB5FDd09] = 1;
        whitelist[0x1C1DB5aD91C161eaE52FB71107CBeb33713A80eA] = 1;
        whitelist[0x926B7d49D58983C43c2ee2801432EEa0fB5FDd09] = 1;
        whitelist[0xC07bA0E8f4444Ee070E0F8894EB83ffAe9e3BB65] = 1;
        whitelist[0xab5773b774c532aAD8E60b088eb77C7cC937448a] = 1;
        whitelist[0xB0bE2fd5ab7b273F0A005a00E910F5417a7D77A6] = 2;
        whitelist[0x05F1bd4Af73B96272b7ff7e7725457685E038291] = 1;
        whitelist[0x7001420371860FCd0d7cCce907C23Ac704b2a51C] = 1;
        whitelist[0xc97B6b037289009378Ef2986D6A33e24D11850bA] = 1;
        whitelist[0x69d4A96E542CaE8e58B4D95a3E8b9810998f367a] = 1;
        whitelist[0x2243D7DDd888697bF4C578c3f2cE7135a7978d01] = 2;
        whitelist[0x16148204Ca1698c330F06f5A1B2F78fF458526fd] = 1;
        whitelist[0x8B22D938774FcBEE58ebe7046457e6020be71f75] = 1;
        whitelist[0x0664e0628DA0505a7411212eBbe5C1346eDeF8CF] = 1;
        whitelist[0x647D2f8b2Ce62e890f2233569D1Eb285e1a3Ccc1] = 1;
        whitelist[0x3a90020Ae28fD195B960Cf65D714d173A7D5f58D] = 1;
        whitelist[0x18b4E48B253D05A663f65552E698E13406B92111] = 1;
        whitelist[0xBb9f0e3639b019246383B54fAed061aFDC765b23] = 1;
        whitelist[0x2C505C48677dAEEa2aE8877D1bb031A4252881F7] = 1;
        whitelist[0xbcbA4FE7E548b67A42342a69b37dBCAf713fb2da] = 1;
        whitelist[0x64944f71089755F1212AA9Bc7a7B8B1822B726dD] = 1;
        whitelist[0xdEDaf4DFCbBa3fd86590E2DCa779D3CD587C1159] = 1;
        whitelist[0xd77c7bD2BD0bC80Fc7016EF133D01bDE4AbaD9D6] = 1;
        whitelist[0x07E837B2781d6a6b367138B10F26B6cDAb3240d7] = 1;
        whitelist[0xef2173600a3BB77156A83fA3a945cdaB7F694806] = 2;
        whitelist[0x10266D3F59Eb61a3bd4B000664dDBC5f7A92bFB9] = 2;
        whitelist[0xB10D095478f1783133cA8DE690bc41197728F636] = 1;
        whitelist[0xb5Ff6e168D8aAFeFBa446696c0E8Dad2f5342E4E] = 2;
        whitelist[0x0e137613A26E44E88e60036871f06C78E5BA83E8] = 2;
        whitelist[0x57Ad5B1b76cce9C1cC7efE2cFD6529eAcb7b9598] = 1;
        whitelist[0xd5a49d8df59bbD066cbdF53638df024E1c8B6c7A] = 1;
        whitelist[0x07C78a10Eff7D0d7CAA6cd1897174e72E617923e] = 1;
        whitelist[0xB2F5494181a07bEAfdF9c1E9739d471029330dA8] = 1;
        whitelist[0x1C7788aE7C63A12C82c78d2B059E9e8Fcb36eBf4] = 1;
        whitelist[0x14711423b8a352481fe9749f05296bDbB87484e1] = 1;
        whitelist[0xFA6f58063c9E1017a829FaB865De85866F8771fa] = 1;
        whitelist[0x22addbF2303D2186eBe6Cf6d60c2c69BdCBf8922] = 1;
        whitelist[0x122926a5461Fc704E39C7f97770FEaf869D3E777] = 1;
        whitelist[0x541e81180b8bc7ddF10DcCEC3dFa7ed278caC316] = 1;
        whitelist[0xFaBaa2b90D57741273309f973FF60b575546645B] = 1;
        whitelist[0xF8FDFcF19D2926D2aB7B5cD91267A52ee04590C0] = 1;
        whitelist[0x50ea1f54FCeEDE08962747C53D400607AdDdc84B] = 1;
        whitelist[0xacdA82541e668bD7E351006190979FF501fC1DDb] = 1;
        whitelist[0x415Bf8755e23601552331ED64b7625D607A60f55] = 1;
        whitelist[0x264b1255D7f4c5DD55450a0C9c79E50e72ac36cF] = 1;
        whitelist[0x9B78148f59ea4a24c4B45832Af992F4CC5482EDE] = 1;
        whitelist[0x289354babce590A31f904791C1014440DC85ec8E] = 1;
        whitelist[0x48f04Ac9Ec8D1AEBF0F7B2Ce13707474FF8892B0] = 1;
        whitelist[0xD4D1b313E8a348F46c53CdaF5AEbFf335d978285] = 1;
        whitelist[0xA9930D9C511C020374bd0F3819bb39592710E040] = 1;
        whitelist[0x6482b61C4a6C893f55eDcAB1C349Bb68ACA400fa] = 1;
        whitelist[0xE4dC30EABE2ce672e3BE58c513C6cC3aB857067B] = 1;
        whitelist[0x6a07Dc2D081D8F8E4fb782CB661f09B88a57cefb] = 1;
        whitelist[0x7A2f29a929C3ae69587e08544B4B618f34F89f18] = 1;
        whitelist[0x0c92e84d858794B8556408EA26402f8B5949dF2E] = 1;
        whitelist[0xe71C8F078Fd7eBCE0E3ec7F9Df0d2Ffb7C3486D6] = 1;
        whitelist[0x03e7Ff9e0315d46baA3CAbc65D572652514be16C] = 1;
        whitelist[0x778bAbE68aD1E0140b05A3Eb8cF2a81019f523B5] = 1;
        whitelist[0xf90c67A4a217B3F551fd7d68Dc772a3211c09668] = 1;
        whitelist[0x8E1Ce4Ced1F5805C9eE46feDE6dB2D71229238f9] = 1;
        whitelist[0xAe70301b8E80Bf8811Ee64eB0A5fcd2f02d81340] = 1;
        whitelist[0x534C1dAC8265bdf59A57842e3A160d7304BAf239] = 1;
        whitelist[0x2cF1019b4EA52fD7a3E5FAf0dde6E6149d040AE0] = 1;
        whitelist[0xF1aede1f1d96c30B47aDbC96F85618b585E32BC9] = 1;
        whitelist[0xBb9f0e3639b019246383B54fAed061aFDC765b23] = 1;
        whitelist[0x4aCabF64AeF8ca056D35367BCaFa1cD78a17Bf1C] = 1;
        whitelist[0xbb99C0E1f4AC76498475BA8faeEB9f70d3054A6E] = 1;
        whitelist[0xbb99C0E1f4AC76498475BA8faeEB9f70d3054A6E] = 1;
        whitelist[0xFeDD077a00FcaBb69594f5d88926F547D0D6D999] = 1;
        whitelist[0xB8e3EABfEfC96fd7F411D2db87db2644Bfd91488] = 1;
        whitelist[0x6BC16fDd15EA75d1dFd6b6C04A18A7dFF3c27d61] = 1;
        whitelist[0xcc88e1C4DC456d7dC5b34e3af9e24b08Cc5BceB7] = 1;
        whitelist[0x6E1EE7Dcd5051786d9FFefbcb7D42DD9074F4f62] = 1;
        whitelist[0x18b4E48B253D05A663f65552E698E13406B92111] = 1;
        whitelist[0xdC6bdDfD9fE9AF653e7132251DD117F4a61648E4] = 1;
        whitelist[0xc475E2eFff10F285c5Db879Bb76164a141339Fae] = 1;
        whitelist[0xf578A59C15feC56b6FfD7F8Aa8493D240a3149e6] = 1;
        whitelist[0xC8cBb41CD1F7a6F49b0F81d7B5B9762231c1432a] = 1;
        whitelist[0x24F4a1d765e22f6257b639ed347667d47Acd4c22] = 1;
        whitelist[0xcDaa7789634E9b4650AB3a764FC57EE7478ca105] = 1;
        whitelist[0x4D2CA70ad8B153936d58Ab4Ce89C0bAc000525C1] = 1;
        whitelist[0x88B6490CdA4cFDEe346f7efD503c01380929Eb20] = 1;
        whitelist[0xbbE88a2F48eAA2EF04411e356d193BA3C1b37200] = 1;
        whitelist[0x64c3fD22dc72AE29718821509Fb95472e1B0B099] = 1;
        whitelist[0x48C93200fEe11403404bc23082d561B7961b4272] = 1;
        whitelist[0x8559CB44ad7B447B17913ee240438F2Fb15BE7e5] = 1;
        whitelist[0x07E837B2781d6a6b367138B10F26B6cDAb3240d7] = 1;
        whitelist[0xdEDaf4DFCbBa3fd86590E2DCa779D3CD587C1159] = 1;
        whitelist[0x2C505C48677dAEEa2aE8877D1bb031A4252881F7] = 1;
        whitelist[0xd77c7bD2BD0bC80Fc7016EF133D01bDE4AbaD9D6] = 1;
        whitelist[0xAE0b0c7c5576a11253D73A223B6DAe3B5dA792D5] = 1;
        whitelist[0x3350ce08b0163a74640552080b4CE1Cfc7cb0E5E] = 1;
        whitelist[0x3350ce08b0163a74640552080b4CE1Cfc7cb0E5E] = 1;
        whitelist[0x8Fb12860850cd6C0E980410aFC380B2512c4E6CF] = 1;
    }

    function updateSwipePrice(uint256 amount) public onlyOwner {
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
        (bool success1, ) = team["alts"].call{value: perc(amount, 20)}("");
        require(success1, failedMessage);

        (bool success2, ) = team["amir"].call{value: perc(amount, 20)}("");
        require(success2, failedMessage);

        (bool success3, ) = team["dracos"].call{value: perc(amount, 60)}("");
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
        require(swipePool[tokenId] < SWIPE_LIMIT, "Swipe limit has been exceeded");

        if (swipePrice > 0) {
            if (msg.value < swipePrice) revert InsufficientBalance(msg.value);
            transferFund(msg.value);
        }

        _swipeCounter.increment();
        _setDataForTokenId(tokenId, _LSP4_METADATA_KEY, getMetadata(metadata));

        swipePool[tokenId] += 1;

        return true;
    }

    ///@notice perc
    ///@param _amount The total amount
    ///@param _bps The precentage
    ///@return percentage %
    function perc(uint256 _amount, uint256 _bps) private pure returns (uint256) {
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
