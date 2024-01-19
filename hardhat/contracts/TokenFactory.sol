// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.2 <0.9.0;

import "./Token.sol";

contract TokenFactory {
    // address of parent contract -> token address
    // mapping(address => address[]) tokensByMarket;
    // mapping(address => uint256) amountOfTokensByMarket;

    function createToken(
        uint256 initialSupply,
        string memory name,
        string memory tag
    ) public returns (address) {
        address newToken = address(
            new Token(msg.sender, initialSupply, name, tag)
        );
        // tokensByMarket[msg.sender].push(newToken);
        // amountOfTokensByMarket[newToken]++;
        return newToken;
    }

    // function getTokensInMarket(
    //     address parent
    // ) public view returns (address[] memory) {
    //     return tokensByMarket[parent];
    // }
}
