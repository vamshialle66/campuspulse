const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://admin:admin%40123@ac-pbeymuf-shard-00-00.eyp1rd7.mongodb.net:27017,ac-pbeymuf-shard-00-01.eyp1rd7.mongodb.net:27017,ac-pbeymuf-shard-00-02.eyp1rd7.mongodb.net:27017/campuspulse?ssl=true&replicaSet=atlas-tm7ang-shard-0&authSource=admin&appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB ERROR:", err.message));

app.use("/auth", require("./routes/auth"));

app.listen(5000, () => console.log("Server running on 5000"));