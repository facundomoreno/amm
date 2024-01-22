import { Contract } from "ethers";
import { ammControllerConstructorArguments } from "../../utils/deployData";

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

        // // deploy all

        // await deployments.fixture("all");

        // // get addresses of deployments

        // ammControllerAddress = (await deployments.get("AMMController")).address;

        // // get the ethers connection to the contract by each address

        // ammControllerContract = (
        //   await ethers.getContractAt("AMMController", ammControllerAddress)
        // ).connect(deployer);
        ammControllerContract = await ethers.deployContract(
          "AMMController",
          ammControllerConstructorArguments
        );

        await ammControllerContract.waitForDeployment();

        stableCurrencyAddress = await ammControllerContract.getStableCurrency();
      });

      describe("Contract initialization", () => {
        it("Create tokens correctly", async () => {
          await ammControllerContract.connect(deployer);

          const tokens = await ammControllerContract.getAllTokens();

          assert(
            tokens.length.toString(),
            ammControllerConstructorArguments[0].length.toString()
          );
        });
        it("Create pools correctly, with the initial balance", async () => {
          await ammControllerContract.connect(deployer);

          const tokens = await ammControllerContract.getAllTokens();

          for (var i = 0; i < tokens.length; i++) {
            // Traer la pool
            const poolAddress = await ammControllerContract.getPoolForToken(
              tokens[i][0]
            );

            const poolContract = await await ethers.getContractAt(
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
              poolTokenReserve.toString(),
              Number(balanceOfPoolInToken).toString()
            );
          }
        });
      });
    });
