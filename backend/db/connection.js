const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables from .env file

const DB_URI = process.env.DB_URI;

async function connectDatabase() {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to database");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

const db = mongoose.connection;

module.exports = { connectDatabase };
