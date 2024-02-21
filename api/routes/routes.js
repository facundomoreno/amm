const express = require("express");

const router = express.Router();

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
    res.status(200).json(dataToSave);
  } catch (e) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/get-user-swaps/:address", async (req, res) => {
  try {
    const data = await SwapData.find({ traderAddress: req.params.address })
      .skip(req.body.offset)
      .limit(req.body.limit);
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/get-prices", async (req, res) => {
  try {
    const data = await HistoricalDataModel.find().sort({ date: "asc" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
