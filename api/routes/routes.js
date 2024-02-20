const express = require("express");

const router = express.Router();

const HistoricalDataModel = require("../models/model");

router.get("/get-prices", async (req, res) => {
  try {
    const data = await HistoricalDataModel.find().sort({ date: "asc" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
