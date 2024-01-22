import { ammControllerConstructorArguments } from "../utils/deployData";

const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { ethers, network, deployments } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async function ({ getNamedAccounts, deployments }: any) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const args = ammControllerConstructorArguments;

  const ammControllerContract = await deploy("AMMController", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (!developmentChains.includes(network.name)) {
    log("Verifying...");
    await verify(ammControllerContract.address, args);
  }

  log("-----------------------------------");
};

module.exports.tags = ["all", "amm_controller"];
