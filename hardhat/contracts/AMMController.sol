// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.2 <0.9.0;

import "./Token.sol";
import "./Pool.sol";

error AMMController_UserAlreadyRegistered();
error AMMController_UsernameInUse();
error AMMController_OnlyOwnerCanCallThisFunction();
error AMMController_InvalidTokenPair();

contract AMMController {
    struct User {
        uint256 id;
        string username;
        bool isRegistered;
    }

    struct TokenCreationProps {
        uint256 initialSupply;
        string name;
        string tag;
    }

    event TokenAdded(address newToken, address marketStableCurrency);

    address private owner;
    address private stableCurrency;

    mapping(address => User) users;
    mapping(string => bool) usedUsernames;
    mapping(address => mapping(address => uint256)) userTokenBalance;

    uint256 private usersCount;

    mapping(uint256 => address) tokens;

    uint256 private tokensCount;

    mapping(address => address) tokenToPool;

    constructor(TokenCreationProps memory _stableCurrency) {
        //AMM controller es dueño de todo el stableToken
        owner = msg.sender;
        stableCurrency = createStableCurrency(
            _stableCurrency.initialSupply,
            _stableCurrency.name,
            _stableCurrency.tag
        );
    }

    function createUser(string memory _username) public {
        User storage userToCreate = users[msg.sender];
        if (userToCreate.isRegistered) {
            revert AMMController_UserAlreadyRegistered();
        }
        if (usedUsernames[_username]) {
            revert AMMController_UsernameInUse();
        }
        userToCreate.id = usersCount;
        userToCreate.username = _username;
        userToCreate.isRegistered = true;
        usedUsernames[_username] = true;

        usersCount++;
    }

    function createToken(
        uint256 initialSupply,
        string memory name,
        string memory tag
    ) public payable returns (address) {
        if (msg.sender != owner) {
            revert AMMController_OnlyOwnerCanCallThisFunction();
        }

        //AmmController es dueño de todo el token
        address newToken = address(
            new Token(msg.sender, initialSupply, name, tag)
        );

        address newPool = address(new Pool(stableCurrency, newToken));

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
    ) public payable returns (address) {
        if (msg.sender != owner) {
            revert AMMController_OnlyOwnerCanCallThisFunction();
        }
        address newToken = address(
            new Token(msg.sender, initialSupply, name, tag)
        );

        return newToken;
    }

    // Trading function to interact with the corresponding pool contract
    //Ver como hacer para detectar cual es el stable e ir a la pool del token!!!!!!
    function tradeTokens(
        address fromToken,
        address toToken,
        bool fromIsStable,
        uint256 amount
    ) external {
        // Validate inputs, check user balances, etc.

        // Get the pool contract address for the token pair
        address poolAddress;

        if (fromIsStable) {
            poolAddress = tokenToPool[toToken];
        } else {
            poolAddress = tokenToPool[fromToken];
        }

        if (poolAddress == address(0)) {
            revert AMMController_InvalidTokenPair();
        }

        // Interact with the pool contract to execute the trade
        Pool poolContract = Pool(poolAddress);
        poolContract.swap(fromToken, amount);

        // Update user balances, emit events, etc.
    }

    // Liquidity provision function to interact with the corresponding pool contract
}
