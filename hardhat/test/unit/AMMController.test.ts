/* global BigInt */
import { ammControllerConstructorArguments as ammCArgs } from "../../utils/deployData";

import { assert, expect } from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
const { ethers, network, deployments } = require("hardhat");
// import {ethers} from "hardhat"
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("AMM proyect unit tests", () => {
      let ammControllerContract: any;
      let stableCurrencyAddress: string;

      beforeEach(async () => {
        const signers = await ethers.getSigners();
        const {
          tokens,
          stableCurrency,
          initialSupplyForTokens,
          initialConversionFromTokenToStable,
          limitNumberOfUsers,
          initialBuyOptionsOfTokensForUsers,
        } = ammCArgs;

        const args = [
          tokens,
          stableCurrency,
          initialSupplyForTokens,
          initialConversionFromTokenToStable,
          limitNumberOfUsers,
          initialBuyOptionsOfTokensForUsers,
        ];

        ammControllerContract = await ethers.deployContract(
          "AMMController",
          args,
          {
            from: signers[0],
          }
        );

        await ammControllerContract.waitForDeployment();

        stableCurrencyAddress = await ammControllerContract.getStableCurrency();
      });

      describe("Contract initialization", () => {
        it("Create tokens correctly", async () => {
          const tokens = await ammControllerContract.getAllTokens();

          assert.equal(
            tokens.length.toString(),
            ammCArgs.tokens.length.toString()
          );
        });
        it("Create pools correctly, with the initial balance", async () => {
          const tokens = await ammControllerContract.getAllTokens();

          for (var i = 0; i < tokens.length; i++) {
            // Traer la pool
            const poolAddress = await ammControllerContract.getPoolForToken(
              tokens[i][0]
            );

            const poolContract = await ethers.getContractAt(
              "Pool",
              poolAddress
            );

            const poolStableCurrencyReserve =
              await poolContract.stableCurrencyReserve();

            const poolTokenReserve = await poolContract.tokenReserve();

            const stableCurrencyContract = await ethers.getContractAt(
              "Token",
              stableCurrencyAddress
            );

            const tokenContract = await ethers.getContractAt(
              "Token",
              tokens[i][0]
            );

            let balanceOfPoolInStableCurrency =
              await stableCurrencyContract.balanceOf(poolAddress);

            let balanceOfPoolInToken = await tokenContract.balanceOf(
              poolAddress
            );

            assert.equal(
              poolStableCurrencyReserve.toString(),
              Number(balanceOfPoolInStableCurrency).toString()
            );

            assert.equal(
              poolStableCurrencyReserve.toString(),
              (
                ammCArgs.initialConversionFromTokenToStable *
                ammCArgs.initialSupplyForTokens
              ).toString()
            );

            assert.equal(
              poolTokenReserve.toString(),
              Number(balanceOfPoolInToken).toString()
            );

            assert.equal(
              poolTokenReserve.toString(),
              ammCArgs.initialSupplyForTokens.toString()
            );
          }
        });
      });

      describe("User creation", () => {
        it("create user correctly, with stable currency balance", async () => {
          const signers = await ethers.getSigners();
          const user = signers[1];

          const userExistsBefore =
            await ammControllerContract.checkIfUserExists(user.address);

          assert.equal(userExistsBefore, false);

          await ammControllerContract.connect(user).createUser("Facu");

          const userExistsAfter = await ammControllerContract.checkIfUserExists(
            user.address
          );

          assert.equal(userExistsAfter, true);

          const newUserTokenBalance =
            await ammControllerContract.getUserBalanceInStableCurrency(
              user.address
            );

          const stableCurrencyContract = await ethers.getContractAt(
            "Token",
            stableCurrencyAddress
          );

          const balanceOfUserInStableCurrencyERC20Contract =
            await stableCurrencyContract.balanceOf(user.address);

          assert.equal(
            newUserTokenBalance.toString(),
            ammCArgs.initialConversionFromTokenToStable *
              ammCArgs.initialBuyOptionsOfTokensForUsers
          );
          assert.equal(
            newUserTokenBalance.toString(),
            balanceOfUserInStableCurrencyERC20Contract
          );
        });
        it("fails if the limit of users is exceded", async () => {
          const signers = await ethers.getSigners();

          for (var i = 0; i < ammCArgs.limitNumberOfUsers; i++) {
            const user = signers[i + 1];
            await ammControllerContract.connect(user).createUser(`User${i}`);

            const newUserTokenBalance =
              await ammControllerContract.getUserBalanceInStableCurrency(
                user.address
              );

            assert.equal(
              newUserTokenBalance.toString(),
              ammCArgs.initialConversionFromTokenToStable *
                ammCArgs.initialBuyOptionsOfTokensForUsers
            );
          }

          // extra invalid user

          const extraUser = signers[ammCArgs.limitNumberOfUsers + 2];

          await expect(
            ammControllerContract
              .connect(extraUser)
              .createUser(`User${ammCArgs.limitNumberOfUsers + 2}`)
          ).to.be.revertedWithCustomError(
            ammControllerContract,
            "AMMController_LimitOfUsersExceded"
          );
        });
        it("fails if user is already registered", async () => {
          const signers = await ethers.getSigners();
          const user = signers[1];
          await ammControllerContract.connect(user).createUser(`Facu`);
          await expect(
            ammControllerContract.connect(user).createUser(`Facu2`)
          ).to.be.revertedWithCustomError(
            ammControllerContract,
            "AMMController_UserAlreadyRegistered"
          );
        });
        it("fails if username is used", async () => {
          const signers = await ethers.getSigners();
          const user1 = signers[1];
          const user2 = signers[2];
          await ammControllerContract.connect(user1).createUser(`Facu`);
          await expect(
            ammControllerContract.connect(user2).createUser(`Facu`)
          ).to.be.revertedWithCustomError(
            ammControllerContract,
            "AMMController_UsernameInUse"
          );
        });
        it("fails if username is too long", async () => {
          const signers = await ethers.getSigners();
          const user1 = signers[1];
          const longUsername = "ThisIsAVeryVeryVeryVeryVeryVeryLongName";
          await expect(
            ammControllerContract.connect(user1).createUser(longUsername)
          ).to.be.revertedWithCustomError(
            ammControllerContract,
            "AMMController_UsernameLengthOf35Exceded"
          );
        });
      });

      describe("Tokens trading", () => {
        beforeEach(async () => {
          const signers = await ethers.getSigners();
          for (var i = 0; i < ammCArgs.limitNumberOfUsers; i++) {
            const newUser = signers[i + 1];
            await ammControllerContract.connect(newUser).createUser(`User${i}`);
          }
        });
        it("trades stable for tokens correctly", async () => {
          const [, trader] = await ethers.getSigners();
          const amountIn =
            ammCArgs.initialConversionFromTokenToStable *
            ammCArgs.initialBuyOptionsOfTokensForUsers;

          const tokenToReceiveAddress = (
            await ammControllerContract.getAllTokens()
          )[0][0];

          const stableCurrencyContract = await ethers.getContractAt(
            "Token",
            stableCurrencyAddress
          );
          const tokenContract = await ethers.getContractAt(
            "Token",
            tokenToReceiveAddress
          );

          // trader gasta todo su stable inicial en un token

          await stableCurrencyContract
            .connect(trader)
            .approve(ammControllerContract.target, amountIn);

          await ammControllerContract
            .connect(trader)
            .tradeTokens(
              stableCurrencyAddress,
              tokenToReceiveAddress,
              amountIn
            );

          const balanceOfUserInStableCurrencyERC20Contract =
            await stableCurrencyContract.balanceOf(trader.address);

          const balanceOfUserInStableCurrencyInsideAmmC =
            await ammControllerContract.getUserBalanceInStableCurrency(
              trader.address
            );

          const balanceOfUserInTokenERC20Contract =
            await tokenContract.balanceOf(trader.address);

          const balanceOfUserInTokenInsideAmmC =
            await ammControllerContract.getUserBalanceInToken(
              trader.address,
              tokenToReceiveAddress
            );

          assert.equal(
            "0",
            balanceOfUserInStableCurrencyERC20Contract.toString()
          );
          assert.equal(
            balanceOfUserInStableCurrencyERC20Contract,
            balanceOfUserInStableCurrencyInsideAmmC
          );

          assert.isAbove(Number(balanceOfUserInTokenERC20Contract), 0);
          assert.equal(
            balanceOfUserInTokenERC20Contract.toString(),
            balanceOfUserInTokenInsideAmmC.toString()
          );
        });
        it("trades tokens for stable correctly", async () => {
          const [, trader] = await ethers.getSigners();

          const amountIn =
            ammCArgs.initialConversionFromTokenToStable *
            ammCArgs.initialBuyOptionsOfTokensForUsers;

          const tokenAddress = (
            await ammControllerContract.getAllTokens()
          )[0][0];

          const stableCurrencyContract = await ethers.getContractAt(
            "Token",
            stableCurrencyAddress
          );
          const tokenContract = await ethers.getContractAt(
            "Token",
            tokenAddress
          );

          // trader gasta todo su stable inicial en un token

          await stableCurrencyContract
            .connect(trader)
            .approve(ammControllerContract.target, amountIn);

          await ammControllerContract
            .connect(trader)
            .tradeTokens(stableCurrencyAddress, tokenAddress, amountIn);

          const userBalanceInStableBefore =
            await stableCurrencyContract.balanceOf(trader.address);
          const userBalanceInTokenBefore = await tokenContract.balanceOf(
            trader.address
          );

          assert.equal(Number(userBalanceInStableBefore), 0);
          assert.isAbove(Number(userBalanceInTokenBefore), 0);

          console.log("BALANCE IN TOKEN BEFORE", userBalanceInTokenBefore);

          await tokenContract
            .connect(trader)
            .approve(ammControllerContract.target, userBalanceInTokenBefore);

          await ammControllerContract
            .connect(trader)
            .tradeTokens(
              tokenAddress,
              stableCurrencyAddress,
              userBalanceInTokenBefore
            );

          const userBalanceInStableAfter =
            await stableCurrencyContract.balanceOf(trader.address);

          console.log("BALANCE IN STABLE AFTER", userBalanceInStableAfter);
          const userBalanceInTokenAfter = await tokenContract.balanceOf(
            trader.address
          );

          assert.isAbove(Number(userBalanceInStableAfter), 0);
          assert.equal(Number(userBalanceInTokenAfter), 0);
        });
        it("increases price of token after you buy some", async () => {
          const [, trader] = await ethers.getSigners();

          const tokenAddress = (
            await ammControllerContract.getAllTokens()
          )[0][0];

          const poolStableReserve =
            await ammControllerContract.getPoolStableCurrencyReserve(
              tokenAddress
            );

          const poolTokenReserve =
            await ammControllerContract.getPoolTokenReserve(tokenAddress);

          const priceOfTokenBefore =
            Number(poolStableReserve) / Number(poolTokenReserve);

          console.log("PRICE before", priceOfTokenBefore);

          assert.equal(
            priceOfTokenBefore,
            ammCArgs.initialConversionFromTokenToStable
          );

          const stableCurrencyContract = await ethers.getContractAt(
            "Token",
            stableCurrencyAddress
          );

          const amountIn =
            ammCArgs.initialConversionFromTokenToStable *
            ammCArgs.initialBuyOptionsOfTokensForUsers;

          await stableCurrencyContract
            .connect(trader)
            .approve(ammControllerContract.target, amountIn);

          await ammControllerContract
            .connect(trader)
            .tradeTokens(stableCurrencyAddress, tokenAddress, amountIn);

          const poolStableReserveAfter =
            await ammControllerContract.getPoolStableCurrencyReserve(
              tokenAddress
            );

          const poolTokenReserveAfter =
            await ammControllerContract.getPoolTokenReserve(tokenAddress);

          const priceOfTokenAfter =
            Number(poolStableReserveAfter) / Number(poolTokenReserveAfter);

          console.log("PRICE after", priceOfTokenAfter);

          assert.isAbove(priceOfTokenAfter, priceOfTokenBefore);

          // Ver el tema de las cuentas porque los usuario pueden comprar muy pocos tokens en comparación a lo que hay
        });
        it("decreases price of token after you sell some", async () => {
          const [, trader] = await ethers.getSigners();

          const amountIn =
            ammCArgs.initialConversionFromTokenToStable *
            ammCArgs.initialBuyOptionsOfTokensForUsers;

          const tokenAddress = (
            await ammControllerContract.getAllTokens()
          )[0][0];

          const stableCurrencyContract = await ethers.getContractAt(
            "Token",
            stableCurrencyAddress
          );
          const tokenContract = await ethers.getContractAt(
            "Token",
            tokenAddress
          );

          // trader gasta todo su stable inicial en un token

          await stableCurrencyContract
            .connect(trader)
            .approve(ammControllerContract.target, amountIn);

          await ammControllerContract
            .connect(trader)
            .tradeTokens(stableCurrencyAddress, tokenAddress, amountIn);

          const poolStableReserveBefore =
            await ammControllerContract.getPoolStableCurrencyReserve(
              tokenAddress
            );

          const poolTokenReserveBefore =
            await ammControllerContract.getPoolTokenReserve(tokenAddress);

          const priceOfTokenBefore =
            Number(poolStableReserveBefore) / Number(poolTokenReserveBefore);

          // Sell tokens

          const userBalanceInTokenBefore = await tokenContract.balanceOf(
            trader.address
          );

          await tokenContract
            .connect(trader)
            .approve(ammControllerContract.target, userBalanceInTokenBefore);

          await ammControllerContract
            .connect(trader)
            .tradeTokens(
              tokenAddress,
              stableCurrencyAddress,
              userBalanceInTokenBefore
            );

          const poolStableReserveAfter =
            await ammControllerContract.getPoolStableCurrencyReserve(
              tokenAddress
            );

          const poolTokenReserveAfter =
            await ammControllerContract.getPoolTokenReserve(tokenAddress);

          const priceOfTokenAfter =
            Number(poolStableReserveAfter) / Number(poolTokenReserveAfter);

          assert.isAbove(priceOfTokenBefore, priceOfTokenAfter);
        });
        it("makes users to win more money when they buy low and sell high, and reverse", async () => {
          // User 1 buys token 1
          // All the other users buy token 1
          // the user 1 buy low and sell high, resulting in more stableCurrency than initial after selling the tokens

          const signers = await ethers.getSigners();

          // initially, all users have a balance in stableCurrency of tokenToStableConversion * initialBuyOptionsOfTokensForUsers

          const tokenAddress = (
            await ammControllerContract.getAllTokens()
          )[0][0];

          const tokenContract = await ethers.getContractAt(
            "Token",
            tokenAddress
          );

          const stableCurrencyContract = await ethers.getContractAt(
            "Token",
            stableCurrencyAddress
          );

          const userWhoBuysLowInitialBalanceInStable =
            await stableCurrencyContract.balanceOf(signers[1]);

          const userWhoBuysHighInitialBalanceInStable =
            await stableCurrencyContract.balanceOf(
              signers[ammCArgs.limitNumberOfUsers]
            );

          const amountIn =
            ammCArgs.initialConversionFromTokenToStable *
            ammCArgs.initialBuyOptionsOfTokensForUsers;

          // all users buy, at the end price will be a lot higher

          for (var i = 0; i < ammCArgs.limitNumberOfUsers; i++) {
            const trader = signers[i + 1];
            await stableCurrencyContract
              .connect(trader)
              .approve(ammControllerContract.target, amountIn);

            await ammControllerContract
              .connect(trader)
              .tradeTokens(stableCurrencyAddress, tokenAddress, amountIn);
          }

          // user 1 sell all tokens

          const userWhoBuysLowsBalanceInToken = await tokenContract.balanceOf(
            signers[1]
          );

          await tokenContract
            .connect(signers[1])
            .approve(
              ammControllerContract.target,
              Number(userWhoBuysLowsBalanceInToken)
            );

          await ammControllerContract
            .connect(signers[1])
            .tradeTokens(
              tokenAddress,
              stableCurrencyAddress,
              Number(userWhoBuysLowsBalanceInToken)
            );

          // last user to buy sell all tokens

          const userWhoBuysHighBalanceInToken = await tokenContract.balanceOf(
            signers[ammCArgs.limitNumberOfUsers]
          );

          await tokenContract
            .connect(signers[ammCArgs.limitNumberOfUsers])
            .approve(
              ammControllerContract.target,
              Number(userWhoBuysHighBalanceInToken)
            );

          await ammControllerContract
            .connect(signers[ammCArgs.limitNumberOfUsers])
            .tradeTokens(
              tokenAddress,
              stableCurrencyAddress,
              Number(userWhoBuysHighBalanceInToken)
            );

          // compare initial and final balances

          const userWhoBuysLowFinalBalanceInStable =
            await stableCurrencyContract.balanceOf(signers[1]);

          const userWhoBuysHighFinalBalanceInStable =
            await stableCurrencyContract.balanceOf(
              signers[ammCArgs.limitNumberOfUsers]
            );

          assert.isAbove(
            Number(userWhoBuysLowFinalBalanceInStable),
            Number(userWhoBuysLowInitialBalanceInStable)
          );

          assert.isAbove(
            Number(userWhoBuysHighInitialBalanceInStable),
            Number(userWhoBuysHighFinalBalanceInStable)
          );
        });
        it("fails if other than contract calls the swap function of pool", async () => {
          const [, user] = await ethers.getSigners();
          const tokens = await ammControllerContract.getAllTokens();

          const poolAddress = await ammControllerContract.getPoolForToken(
            tokens[0][0]
          );

          const poolContract = await ethers.getContractAt("Pool", poolAddress);

          await expect(
            poolContract.swap(tokens[0][0], 100, user.address)
          ).to.be.revertedWithCustomError(
            poolContract,
            "Pool_OnlyOwnerCanCallThisFunction"
          );
        });
        it("fails if user sent different amount than necessary for swap", async () => {
          const [, trader] = await ethers.getSigners();
          const tokens = await ammControllerContract.getAllTokens();

          const stableCurrencyContract = await ethers.getContractAt(
            "Token",
            stableCurrencyAddress
          );

          const amountIn =
            ammCArgs.initialConversionFromTokenToStable *
            ammCArgs.initialBuyOptionsOfTokensForUsers;

          await stableCurrencyContract
            .connect(trader)
            .approve(ammControllerContract.target, amountIn);

          await expect(
            ammControllerContract
              .connect(trader)
              .tradeTokens(stableCurrencyAddress, tokens[0][0], amountIn + 1)
          ).to.be.revertedWithCustomError(
            ammControllerContract,
            "AMMController_AllowanceDifferOrAmountZero"
          );

          await expect(
            ammControllerContract
              .connect(trader)
              .tradeTokens(stableCurrencyAddress, tokens[0][0], amountIn - 1)
          ).to.be.revertedWithCustomError(
            ammControllerContract,
            "AMMController_AllowanceDifferOrAmountZero"
          );

          await expect(
            ammControllerContract
              .connect(trader)
              .tradeTokens(stableCurrencyAddress, tokens[0][0], 0)
          ).to.be.revertedWithCustomError(
            ammControllerContract,
            "AMMController_AllowanceDifferOrAmountZero"
          );

          await expect(
            ammControllerContract
              .connect(trader)
              .tradeTokens(stableCurrencyAddress, tokens[0][0], amountIn)
          ).to.emit(ammControllerContract, "TradeExecuted");
        });
        it("fails if pool can't return enough tokenOut", async () => {
          const signers = await ethers.getSigners();

          const tokenToReceiveAddress = (
            await ammControllerContract.getAllTokens()
          )[0][0];

          const stableCurrencyContract = await ethers.getContractAt(
            "Token",
            stableCurrencyAddress
          );

          const amountIn =
            ammCArgs.initialConversionFromTokenToStable *
            ammCArgs.initialBuyOptionsOfTokensForUsers;

          for (var i = 0; i < ammCArgs.limitNumberOfUsers; i++) {
            const trader = signers[i + 1];

            // tokenIn
            const poolStableReserve =
              await ammControllerContract.getPoolStableCurrencyReserve(
                tokenToReceiveAddress
              );

            // tokenOut

            const poolTokenReserve =
              await ammControllerContract.getPoolTokenReserve(
                tokenToReceiveAddress
              );

            const expectedAmountOut =
              (Number(poolTokenReserve) * amountIn) /
              (Number(poolStableReserve) + amountIn);

            if (expectedAmountOut >= 1) {
              await stableCurrencyContract
                .connect(trader)
                .approve(ammControllerContract.target, amountIn);

              await ammControllerContract
                .connect(trader)
                .tradeTokens(
                  stableCurrencyAddress,
                  tokenToReceiveAddress,
                  amountIn
                );
            } else {
              const poolAddress = await ammControllerContract.getPoolForToken(
                tokenToReceiveAddress
              );

              const poolContract = await ethers.getContractAt(
                "Pool",
                poolAddress
              );

              await stableCurrencyContract
                .connect(trader)
                .approve(ammControllerContract.target, amountIn);

              await expect(
                ammControllerContract
                  .connect(trader)
                  .tradeTokens(
                    stableCurrencyAddress,
                    tokenToReceiveAddress,
                    amountIn
                  )
              ).to.be.revertedWithCustomError(
                poolContract,
                "Pool_NotEnoughTokenOutInPoolToReturnThatAmount"
              );
            }
          }
        });
        it("fails if an external account try to trade", async () => {
          const signers = await ethers.getSigners();

          const amountIn =
            ammCArgs.initialConversionFromTokenToStable *
            ammCArgs.initialBuyOptionsOfTokensForUsers;

          const tokenToReceiveAddress = (
            await ammControllerContract.getAllTokens()
          )[0][0];

          const stableCurrencyContract = await ethers.getContractAt(
            "Token",
            stableCurrencyAddress
          );

          await stableCurrencyContract.approve(
            ammControllerContract.target,
            amountIn
          );

          // signers[0] is not a registered user
          await expect(
            ammControllerContract
              .connect(signers[0])
              .tradeTokens(
                stableCurrencyAddress,
                tokenToReceiveAddress,
                amountIn
              )
          ).to.be.revertedWithCustomError(
            ammControllerContract,
            "AMMController_NotUser"
          );
        });
      });
    });
