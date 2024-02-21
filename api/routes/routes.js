const express = require("express");

const router = express.Router();
const updatePrices = require("../utils/updatePrices");
const HistoricalDataModel = require("../models/HistoricalDataModel");
const SwapData = require("../models/SwapData");

router.post("/new-swap", async (req, res) => {
  const data = new SwapData({
    traderAddress: req.body.traderAddress,
    tokenFrom: req.body.tokenFrom,
    tokenTo: req.body.tokenTo,
    amountGiven: req.body.amountGiven,
    amountReceived: req.body.amountReceived,
    date: req.body.date,
  });

  try {
    const dataToSave = await data.save();
    await updatePrices();
    res.status(200).json(dataToSave);
  } catch (e) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/get-user-swaps/:address", async (req, res) => {
  try {
    const data = await SwapData.find({ traderAddress: req.params.address })
      .sort({ date: "desc" })
      .skip(req.body.offset)
      .limit(req.body.limit);
    const dataCount = await SwapData.countDocuments({
      traderAddress: req.params.address,
    });
    res.json({ history: data, count: dataCount });
  } catch (e) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/get-prices", async (req, res) => {
  try {
    const data = await HistoricalDataModel.find().sort({ date: "asc" });
    const resultOfMaxQuery = await HistoricalDataModel.find({
      "tokensData.price": { $ne: null },
    }) // Avoid null prices (optional)
      .sort({ "tokensData.price": -1 }) // Sort in descending order based on price
      .limit(1);
    res.json({
      historicalPrices: data,
      maxValue: resultOfMaxQuery[0].tokensData[0].price,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
