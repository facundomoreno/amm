// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./Token.sol";
import "./Pool.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/hardhat/console.sol";

error AMMController_UserAlreadyRegistered();
error AMMController_UsernameInUse();
error AMMController_OnlyOwnerCanCallThisFunction();
error AMMController_InvalidTokenPair();
error AMMController_StableCurrencyIsRequired();
error AMMController_InsufficientFunds();
error AMMController_AllowanceDifferOrAmountZero();
error AMMController_LimitOfUsersExceded();
error AMMController_ErrorTest();
error AMMController_NotUser();

contract AMMController {
    struct User {
        uint256 id;
        string username;
        bool isRegistered;
    }

    struct TokenCreationProps {
        string name;
        string tag;
    }
    struct GetAllTokensReturns {
        address tokenAddress;
        string name;
        string tag;
    }

    event TradeExecuted(
        address negotiator,
        address fromToken,
        address toToken,
        uint256 amountIn,
        uint256 amountOutReceived
    );

    address private owner;
    address private stableCurrency;

    uint256 private initialTokensForUsers;
    uint256 private limitNumberOfUsers;
    uint256 private usersCount;
    uint256 private tokensCount;
    uint256 private initialConversionRateFromTokenToStable;

    mapping(address => User) private users;
    mapping(string => bool) private usedUsernames;
    mapping(address => mapping(address => uint256)) private userTokenBalance;
    mapping(address => uint) private userStableCurrencyBalance;
    mapping(uint256 => address) private tokens;
    mapping(address => address) private tokenToPool;

    constructor(
        TokenCreationProps[] memory _tokens, // T = 11
        TokenCreationProps memory _stableCurrency, // Supply = 253000
        uint256 _initialSupplyForTokens, // #T = 20
        uint256 _initialConversionRateFromTokenToStable, // C = 1000
        uint256 _limitNumberOfUsers, // p = 11
        uint256 _initialTokensForUsers // 3,
    ) {
        owner = msg.sender;

        initialConversionRateFromTokenToStable = _initialConversionRateFromTokenToStable;
        limitNumberOfUsers = _limitNumberOfUsers;
        initialTokensForUsers = _initialTokensForUsers;

        uint256 supplyForStableCurrency = (_limitNumberOfUsers *
            _initialTokensForUsers *
            _initialConversionRateFromTokenToStable) +
            (_initialSupplyForTokens *
                _initialConversionRateFromTokenToStable *
                _tokens.length);

        stableCurrency = createStableCurrency(
            supplyForStableCurrency,
            _stableCurrency.name,
            _stableCurrency.tag
        );

        for (uint256 i = 0; i < _tokens.length; i++) {
            createToken(
                _initialSupplyForTokens,
                _tokens[i].name,
                _tokens[i].tag
            );
        }
    }

    function createUser(string memory _username) public {
        User storage userToCreate = users[msg.sender];
        if (userToCreate.isRegistered) {
            revert AMMController_UserAlreadyRegistered();
        }
        if (usedUsernames[_username]) {
            revert AMMController_UsernameInUse();
        }
        if (limitNumberOfUsers <= usersCount) {
            revert AMMController_LimitOfUsersExceded();
        }
        userToCreate.id = usersCount;
        userToCreate.username = _username;
        userToCreate.isRegistered = true;
        usedUsernames[_username] = true;

        usersCount++;

        ERC20 erc20StableCurrency = ERC20(stableCurrency);
        uint256 initialCurrencyForUser = initialTokensForUsers *
            initialConversionRateFromTokenToStable;

        erc20StableCurrency.transfer(msg.sender, initialCurrencyForUser);

        userStableCurrencyBalance[msg.sender] = initialCurrencyForUser;
    }

    function createToken(
        uint256 _initialSupply,
        string memory _name,
        string memory _tag
    ) private returns (address) {
        if (stableCurrency == address(0)) {
            revert AMMController_StableCurrencyIsRequired();
        }

        address newToken = address(new Token(_initialSupply, _name, _tag));

        uint256 tokenReserve = _initialSupply;
        uint256 stableCurrencyReserve = _initialSupply *
            initialConversionRateFromTokenToStable;

        address newPool = address(
            new Pool(
                stableCurrency,
                newToken,
                stableCurrencyReserve,
                tokenReserve
            )
        );

        ERC20 erc20NewToken = ERC20(newToken);
        ERC20 erc20StableCurrency = ERC20(stableCurrency);

        erc20NewToken.transfer(newPool, tokenReserve);
        erc20StableCurrency.transfer(newPool, stableCurrencyReserve);

        tokens[tokensCount] = newToken;
        tokenToPool[newToken] = newPool;

        tokensCount++;

        return newToken;
    }

    function createStableCurrency(
        uint256 _initialSupply,
        string memory _name,
        string memory _tag
    ) private returns (address) {
        address newToken = address(new Token(_initialSupply, _name, _tag));

        return newToken;
    }

    function tradeTokens(
        address _fromToken,
        address _toToken,
        uint256 _amountIn
    ) public {
        ERC20 fromTokenERC20 = ERC20(_fromToken);

        if (!users[msg.sender].isRegistered) {
            revert AMMController_NotUser();
        }
        if (
            (fromTokenERC20.allowance(msg.sender, address(this)) !=
                _amountIn) || _amountIn < 1
        ) {
            revert AMMController_AllowanceDifferOrAmountZero();
        }

        if (
            !((_fromToken == stableCurrency &&
                tokenToPool[_toToken] != address(0)) ||
                (_toToken == stableCurrency &&
                    tokenToPool[_fromToken] != address(0)))
        ) {
            revert AMMController_InvalidTokenPair();
        }

        address poolAddress;

        if (tokenToPool[_fromToken] == address(0)) {
            poolAddress = tokenToPool[_toToken];
        } else {
            poolAddress = tokenToPool[_fromToken];
        }

        // previously, the user approves this address to spend the amount, outside the contract.

        fromTokenERC20.transferFrom(msg.sender, poolAddress, _amountIn);

        Pool poolContract = Pool(poolAddress);

        uint256 amountOutReceived = poolContract.swap(
            _fromToken,
            _amountIn,
            msg.sender
        );

        if (_fromToken == stableCurrency) {
            userStableCurrencyBalance[msg.sender] -= _amountIn;
            userTokenBalance[msg.sender][_toToken] += amountOutReceived;
        } else {
            userTokenBalance[msg.sender][_fromToken] -= _amountIn;
            userStableCurrencyBalance[msg.sender] += amountOutReceived;
        }

        emit TradeExecuted(
            msg.sender,
            _fromToken,
            _toToken,
            _amountIn,
            amountOutReceived
        );
    }

    function checkIfUserExists(
        address possibleUser
    ) public view returns (bool) {
        return users[possibleUser].isRegistered;
    }

    function getUserByAddress(
        address _userAddress
    ) public view returns (User memory) {
        return users[_userAddress];
    }

    function getAllTokens() public view returns (GetAllTokensReturns[] memory) {
        GetAllTokensReturns[] memory tokensDataList = new GetAllTokensReturns[](
            tokensCount
        );
        for (uint256 i = 0; i < tokensCount; i++) {
            ERC20 tokenX = ERC20(tokens[i]);
            tokensDataList[i].tokenAddress = tokens[i];
            tokensDataList[i].name = tokenX.name();
            tokensDataList[i].tag = tokenX.symbol();
        }
        return tokensDataList;
    }

    function getPoolForToken(address _token) public view returns (address) {
        return tokenToPool[_token];
    }

    function getStableCurrency() public view returns (address) {
        return stableCurrency;
    }

    function getUserBalanceInToken(
        address _userAddress,
        address _token
    ) public view returns (uint256) {
        return userTokenBalance[_userAddress][_token];
    }

    function getUserBalanceInStableCurrency(
        address _userAddress
    ) public view returns (uint256) {
        return userStableCurrencyBalance[_userAddress];
    }

    function getPoolStableCurrencyReserve(
        address _tokenOfPool
    ) public view returns (uint256) {
        Pool poolContract = Pool(tokenToPool[_tokenOfPool]);

        return poolContract.getStableCurrencyReserve();
    }

    function getPoolTokenReserve(
        address _tokenOfPool
    ) public view returns (uint256) {
        Pool poolContract = Pool(tokenToPool[_tokenOfPool]);

        return poolContract.getTokenReserve();
    }
}
