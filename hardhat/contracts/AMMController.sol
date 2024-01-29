// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.2 <0.9.0;

import "../node_modules/hardhat/console.sol";
import "./Token.sol";
import "./Pool.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

error AMMController_UserAlreadyRegistered();
error AMMController_UsernameInUse();
error AMMController_OnlyOwnerCanCallThisFunction();
error AMMController_InvalidTokenPair();
error AMMController_StableCurrencyIsRequired();
error AMMController_InsufficientFunds();
error AMMController__LimitOfUsersExceded();

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

    event TokenAdded(address newToken, address marketStableCurrency);
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
        //AMM controller es dueño de todo el stableToken
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
            revert AMMController__LimitOfUsersExceded();
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
        uint256 initialSupply,
        string memory name,
        string memory tag
    ) private returns (address) {
        if (stableCurrency == address(0)) {
            revert AMMController_StableCurrencyIsRequired();
        }

        address newToken = address(new Token(initialSupply, name, tag));

        uint256 tokenReserve = initialSupply;
        uint256 stableCurrencyReserve = initialSupply *
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

        emit TokenAdded(newToken, newPool);

        return newToken;
    }

    function createStableCurrency(
        uint256 initialSupply,
        string memory name,
        string memory tag
    ) private returns (address) {
        address newToken = address(new Token(initialSupply, name, tag));

        return newToken;
    }

    function tradeTokens(
        address fromToken,
        address toToken,
        uint256 amountIn
    ) public {
        if (
            !((fromToken == stableCurrency &&
                tokenToPool[toToken] != address(0)) ||
                (toToken == stableCurrency &&
                    tokenToPool[fromToken] != address(0)))
        ) {
            revert AMMController_InvalidTokenPair();
        }

        if (
            fromToken == stableCurrency &&
            getUserBalanceInStableCurrency(msg.sender) < amountIn
        ) {
            revert AMMController_InsufficientFunds();
        } 
        if (fromToken != stableCurrency && getUserBalanceInToken(msg.sender, fromToken) < amountIn) {
                revert AMMController_InsufficientFunds();
        }
        

        address poolAddress;

        if (tokenToPool[fromToken] == address(0)) {
            poolAddress = tokenToPool[toToken];
        } else {
            poolAddress = tokenToPool[fromToken];
        }

        userApproveTransfer(fromToken, amountIn, poolAddress);

        Pool poolContract = Pool(poolAddress);

        console.log("------------");
        console.log(fromToken, amountIn, poolAddress, msg.sender);

        uint256 amountOutReceived = poolContract.swap(
            fromToken,
            amountIn,
            msg.sender
        );

        userTokenBalance[msg.sender][fromToken] -= amountIn;
        userTokenBalance[msg.sender][toToken] += amountOutReceived;

        emit TradeExecuted(
            msg.sender,
            fromToken,
            toToken,
            amountIn,
            amountOutReceived
        );
    }

    function userApproveTransfer(
        address _token,
        uint256 _amount,
        address _spender
    ) public {
        ERC20 token = ERC20(_token);
        console.log(_token, _amount, _spender, msg.sender);
        token.approve(_spender, _amount);
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
}
