const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const userRoutes = require("../routes/userRoute");
const itemsRoutes = require("../routes/itemRoute");
const cartRoutes = require("../routes/cartRoute");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/v1/main", (req, res) => {
  res.status(200).json({ msg: "hey there everyone" });
});

app.use("/", (req,res)=> {
  res.send("hello")
})

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/items", itemsRoutes);
app.use("/api/v1/cart", cartRoutes);

// Mongoose connection caching for serverless
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("MongoDB Connected");
}

// Export Express as a Vercel serverless function
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
