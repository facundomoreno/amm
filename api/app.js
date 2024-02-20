var express = require("express");
const routes = require("./routes/routes");
const mongoose = require("mongoose");
const updatePrices = require("./utils/updatePrices");
require("dotenv").config();

var app = express();
var port = process.env.SERVER_PORT;
const mongoString = process.env.DATABASE_URL;

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

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,DELETE,POST,PUT"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

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
  }, 10000);
});
