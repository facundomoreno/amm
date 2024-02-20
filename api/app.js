var express = require("express");
const routes = require("./routes/routes");
const cors = require("cors");
const mongoose = require("mongoose");
const updatePrices = require("./utils/updatePrices");
require("dotenv").config();

var app = express();
app.use(cors());
var port = process.env.SERVER_PORT;
const mongoString = process.env.DATABASE_URL;
const minutesBetweenUpdates = process.env.MINUTES_BETWEEN_UPDATES;

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

app.use(express.json());

app.use("/api", routes);

// app.use(function (req, res, next) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });

app.get("/historical-prices", function (req, res) {
  res.send("Hello World!");
});

app.listen(port, function () {
  console.log("App running in port: " + port);
  setInterval(async () => {
    try {
      await updatePrices();
    } catch (e) {
      console.log(e.message);
    }
  }, minutesBetweenUpdates * 60000);
});
