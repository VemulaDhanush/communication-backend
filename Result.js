const mongoose = require("mongoose");

// models/Result.js lo ila undali
const resultSchema = new mongoose.Schema({
  name: String,
  email: String,
  mode: String,
  score: Number, // Idi 'Number' type lo undali
  date: { type: Date, default: Date.now }
});


module.exports = mongoose.model("Result", resultSchema);