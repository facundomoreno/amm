const { ethers } = require("hardhat");

export interface networkConfigItem {
  name: string;
  blockConfirmations?: number;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

const networkConfig: networkConfigInfo = {
  11155111: {
    name: "sepolia",
    blockConfirmations: 4,
  },
  31337: {
    name: "hardhat",
    blockConfirmations: 1,
  },
};
const developmentChains = ["hardhat", "localhost"];

module.exports = {
  networkConfig,
  developmentChains,
};
