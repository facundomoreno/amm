class CPAMM:
    def __init__(self, token0, token1):
        self.reserve0 = 0
        self.reserve1 = 0
        self.token0 = token0
        self.token1 = token1
        self.balanceOf = {
            token0: 0,
            token1: 0,
        }

    def _update(self, reserve0, reserve1):
        self.reserve0 = reserve0
        self.reserve1 = reserve1

    def add_liquidity(self, token, amount):
        assert token == self.token0 or token == self.token1, "Invalid token"
        assert amount > 0, "Amount = 0"

        if token == self.token0:
            self.balanceOf[token] += amount
            self.reserve0 += amount
        else:
            self.balanceOf[token] += amount
            self.reserve1 += amount

    def swap(self, tokenIn, amountIn, wallet):
        assert tokenIn == self.token0 or tokenIn == self.token1, "Invalid token"
        assert amountIn > 0, "Amount in = 0"
        assert wallet[tokenIn] >= amountIn, "Insufficient funds"

        isToken0 = tokenIn == self.token0
        if isToken0:
            tokenIn, tokenOut, reserveIn, reserveOut = (
                self.token0,
                self.token1,
                self.reserve0,
                self.reserve1,
            )
        else:
            tokenIn, tokenOut, reserveIn, reserveOut = (
                self.token1,
                self.token0,
                self.reserve1,
                self.reserve0,
            )

        # Mocking the transferFrom function
        # tokenIn.transferFrom(msg.sender, address(this), amountIn)
        # ...
        wallet[tokenIn] -= amountIn
        self.balanceOf[tokenIn] += amountIn

        # Calculating the amountOut using the formula in the Solidity code
        amountOut = (reserveOut * amountIn) // (reserveIn + amountIn)

        # Mocking the transfer function
        # tokenOut.transfer(msg.sender, amountOut)
        # ...

        wallet[tokenOut] += amountOut
        self.balanceOf[tokenOut] -= amountOut

        # Mocking the _update function
        # self._update(token0.balanceOf(address(this)), token1.balanceOf(address(this)))
        # ...
        self._update(self.balanceOf[self.token0], self.balanceOf[self.token1])

    def priceOf(self, token):
        assert token == self.token0 or token == self.token1, "Invalid token"

        if token == self.token0:
            return self.reserve1 // self.reserve0
        else:
            return self.reserve0 // self.reserve1


# Mocking the IERC20 interface
class IERC20:
    def totalSupply(self):
        pass

    def balanceOf(self, account):
        pass

    def transfer(self, recipient, amount):
        pass

    def allowance(self, owner, spender):
        pass

    def approve(self, spender, amount):
        pass

    def transferFrom(self, sender, recipient, amount):
        pass

    # Mocking events
    def Transfer(self, from_address, to_address, amount):
        pass

    def Approval(self, owner, spender, amount):
        pass
