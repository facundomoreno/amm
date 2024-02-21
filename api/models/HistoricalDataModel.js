const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const dataSchema = new mongoose.Schema({
  tokensData: [tokenSchema],
  date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("HistoricalData", dataSchema);
