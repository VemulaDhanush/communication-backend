const mongoose = require("mongoose");


const resultSchema = new mongoose.Schema({
  name: String,
  email: String,
  mode: String,
  score: Number, // Idi 'Number' type lo undali
  date: { type: Date, default: Date.now }
});


module.exports = mongoose.model("Result", resultSchema);
