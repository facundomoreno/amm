const express = require("express");

const router = express.Router();

const HistoricalDataModel = require("../models/model");

const contractAbi = require("../abis/AmmController.abi.json");

const ethers = require("ethers");

// router.post("/update-prices", async (req, res) => {
//   let url = process.env.RPC_URL;

//   const provider = new ethers.JsonRpcProvider(url);

//   const intermediaryWallet = await ethers.Wallet.createRandom(provider);

//   const contractForView = new ethers.Contract(
//     process.env.CONTRACT_ADDRESS,
//     contractAbi,
//     intermediaryWallet
//   );

//   const tokensResFromEthers = await contractForView.getAllTokens();

//   const currentDate = new Date();

//   const tokensDataForDb = await Promise.all(
//     tokensResFromEthers.map(async (item) => {
//       const poolStableReserve =
//         await contractForView.getPoolStableCurrencyReserve(item[0]);
//       const poolTokenReserve = await contractForView.getPoolTokenReserve(
//         item[0]
//       );

//       const marketValue = Math.ceil(
//         Math.abs(Number(poolStableReserve) / (1 - Number(poolTokenReserve)))
//       );

//       return {
//         address: item[0],
//         name: item[1],
//         tag: item[2],
//         price: marketValue,
//       };
//     })
//   );

//   const newEntry = new HistoricalDataModel({
//     tokensData: tokensDataForDb,
//     date: currentDate,
//   });

//   try {
//     const newEntryToSave = await newEntry.save();
//     res.status(200).json(newEntryToSave);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

router.get("/get-prices", async (req, res) => {
  try {
    const data = await HistoricalDataModel.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
