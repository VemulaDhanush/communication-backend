const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Result = require("./models/Result");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- MONGODB CONNECTION ---------------- */

mongoose.connect(
  "mongodb+srv://vemuladhanush:Dhanush%402006@communication.zewq0op.mongodb.net/communicationDB"
)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Error:", err));

/* ---------------- ANALYZE API ---------------- */

app.post("/api/analyze", async (req, res) => {
  try {
    const { text, name, email, mobile, mode } = req.body;

  const response = await axios.post(
  "https://communication-ai.onrender.com/analyze",
  { 
    text,
    category: "english",
    mode
  }
);

    const finalScore = response.data.overall_score || response.data.score || 0;

    const newResult = new Result({
      name,
      email,
      mobile,
      mode,
      score: finalScore
    });

    await newResult.save();

    res.json(response.data);

  } catch (error) {

    console.error("ANALYZE ERROR:", error.message);

    res.status(500).json({
      error: "Server Error",
      details: error.message
    });
  }
});

/* ---------------- HISTORY API ---------------- */

app.get("/api/history/:email", async (req, res) => {
  try {

    const { email } = req.params;

    const history = await Result.find({ email }).sort({ date: -1 });

    res.json(history);

  } catch (error) {

    res.status(500).json({ error: "Error fetching history" });

  }
});

/* ---------------- REGISTER ---------------- */

app.post("/api/register", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: "Registered successfully" });

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }
});

/* ---------------- LOGIN ---------------- */

app.post("/api/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    console.log("LOGIN ERROR:", error);

    res.status(500).json({ message: "Server error" });

  }
});

/* ---------------- START SERVER ---------------- */

app.listen(5001, () => {
  console.log("Node server running on http://localhost:5001");
});
