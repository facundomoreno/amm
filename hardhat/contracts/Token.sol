// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(
        uint256 initialSupply,
        string memory name,
        string memory tag
    ) ERC20(name, tag) {
        _mint(msg.sender, initialSupply);
    }
}
