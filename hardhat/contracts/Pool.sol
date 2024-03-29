// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

error Pool_OnlyOwnerCanCallThisFunction();
error Pool_ReceivedDifferentValueThanNecessaryForSwap();
error Pool_InvalidToken();
error Pool_NotEnoughTokenOutInPoolToReturnThatAmount();

contract Pool {
    ERC20 public immutable stableCurrency;
    ERC20 public immutable token;

    address owner;

    uint256 public stableCurrencyReserve;
    uint256 public tokenReserve;

    constructor(
        address _stableCurrency,
        address _token,
        uint256 _stableCurrencyReserve,
        uint256 _tokenReserve
    ) {
        stableCurrency = ERC20(_stableCurrency);
        token = ERC20(_token);
        _update(_stableCurrencyReserve, _tokenReserve);
        owner = msg.sender;
    }

    function _update(uint _stableCurrencyReserve, uint _tokenReserve) private {
        stableCurrencyReserve = _stableCurrencyReserve;
        tokenReserve = _tokenReserve;
    }

    function swap(
        address _tokenIn,
        uint256 _amountIn,
        address _negotiator
    ) external returns (uint amountOut) {
        bool isstableCurrency = _tokenIn == address(stableCurrency);

        (
            ERC20 tokenIn,
            ERC20 tokenOut,
            uint256 reserveIn,
            uint256 reserveOut
        ) = isstableCurrency
                ? (stableCurrency, token, stableCurrencyReserve, tokenReserve)
                : (token, stableCurrency, tokenReserve, stableCurrencyReserve);

        amountOut = (reserveOut * _amountIn) / (reserveIn + _amountIn);

        if (msg.sender != owner) {
            revert Pool_OnlyOwnerCanCallThisFunction();
        }
        if (
            !(_tokenIn == address(stableCurrency) || _tokenIn == address(token))
        ) {
            revert Pool_InvalidToken();
        }
        if (amountOut < 1) {
            revert Pool_NotEnoughTokenOutInPoolToReturnThatAmount();
        }

        if (tokenIn.balanceOf(address(this)) != (reserveIn + _amountIn)) {
            revert Pool_ReceivedDifferentValueThanNecessaryForSwap();
        }

        /*
        How much dy for dx?

        xy = k
        (x + dx)(y - dy) = k
        y - dy = k / (x + dx)
        y - k / (x + dx) = dy
        y - xy / (x + dx) = dy
        (yx + ydx - xy) / (x + dx) = dy
        ydx / (x + dx) = dy
        */
        // 0.3% fee

        tokenOut.transfer(_negotiator, amountOut);

        _update(
            stableCurrency.balanceOf(address(this)),
            token.balanceOf(address(this))
        );

        return amountOut;
    }

    function getStableCurrencyReserve() public view returns (uint256) {
        return stableCurrencyReserve;
    }

    function getTokenReserve() public view returns (uint256) {
        return tokenReserve;
    }
}
