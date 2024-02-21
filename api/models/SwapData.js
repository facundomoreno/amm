const mongoose = require("mongoose");

const swapData = new mongoose.Schema({
  traderAddress: {
    type: String,
    required: true,
  },
  tokenFrom: {
    type: String,
    required: true,
  },
  tokenTo: {
    type: String,
    required: true,
  },
  amountGiven: {
    type: Number,
    required: true,
  },
  amountReceived: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("SwapData", swapData);
