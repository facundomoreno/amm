var express = require("express");
const routes = require("./routes/routes");
const cors = require("cors");
const mongoose = require("mongoose");
const { updatePrices } = require("./utils/ethersFunctions");
const dotenv = require("dotenv");

dotenv.config();

var app = express();
app.use(cors());
var port = process.env.PORT;
const mongoString = process.env.DATABASE_URL;
const minutesBetweenUpdates = process.env.MINUTES_BETWEEN_UPDATES;

app.use(express.json());

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.use("/api", routes);

mongoose.connect(mongoString).then(() => {
  const database = mongoose.connection;

  database.on("error", (error) => {
    console.log(error);
  });
  app.listen(port, "0.0.0.0", function () {
    console.log("App running in port: " + port);
    updatePrices();
    setInterval(async () => {
      try {
        await updatePrices();
      } catch (e) {
        console.log(e.message);
      }
    }, minutesBetweenUpdates * 60000);
  });
});
