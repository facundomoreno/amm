// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(
        address creator,
        uint256 initialSupply,
        string memory name,
        string memory tag
    ) ERC20(name, tag) {
        _mint(creator, initialSupply);
    }
}
