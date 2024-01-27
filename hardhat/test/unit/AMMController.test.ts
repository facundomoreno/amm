import { Contract } from "ethers";
import { ammControllerConstructorArguments as ammCArgs } from "../../utils/deployData";

import { assert, expect } from "chai";

const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");
import { ethers, network } from "hardhat";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("AMM proyect unit tests", () => {
      let ammControllerContract: any;
      let ammControllerAddress: string;
      let deployer: any;
      let stableCurrencyAddress: string;

      beforeEach(async () => {
        const [deployerResult] = await ethers.getSigners();
        deployer = deployerResult;

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
          args
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

          await ammControllerContract.connect(user).createUser("Facu");

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
          ).to.be.rejectedWith("AMMController__LimitOfUsersExceded");
        });
        it("fails if user is already registered", async () => {
          const signers = await ethers.getSigners();
          const user = signers[1];
          await ammControllerContract.connect(user).createUser(`Facu`);
          await expect(ammControllerContract.connect(user).createUser(`Facu2`)).to.be.rejectedWith("AMMController_UserAlreadyRegistered");
        });
        it("fails if username is used", async () => {
          const signers = await ethers.getSigners();
          const user1 = signers[1];
          const user2 = signers[2];
          await ammControllerContract.connect(user1).createUser(`Facu`);
          await expect(ammControllerContract.connect(user2).createUser(`Facu`)).to.be.rejectedWith("AMMController_UsernameInUse")
        });
      });

      describe("Tokens trading", () => {
        
      })
    });
