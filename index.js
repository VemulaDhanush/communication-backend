const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const Result = require("./models/Result");
const bcrypt = require("bcryptjs");
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

    // 1. Flask AI server call
    // Flask server (Port 5000) run avtundo ledo check chesko
    const response = await axios.post("https://communication-ai.onrender.com/analyze", { text });

    // 2. Score mapping
    // Flask nundi 'score' ane direct key rakapothe crash avtundi
    // Flask response structure ni batti ikkada marchali
    const finalScore = response.data.overall_score || response.data.score || 0;

    // 3. Save to MongoDB
  const newResult = new Result({
  name,
  email,
  mobile,
  mode,

  score: response.data.overall_score || response.data.score || 0 
});
;

    await newResult.save();

    // Flask nundi vachina motham data ni front-end ki pampinchu
    res.json(response.data);

  } catch (error) {
    // Ikkada error log chesthe terminal lo kanipisthundi exact problem enti ani
    console.error("ANALYZE ERROR:", error.message);
    
    res.status(500).json({
      error: "Server Error",
      details: error.message // Debugging kosam idi help avtundi
    });
  }
});

/* ---------------- START SERVER ---------------- */
app.get("/api/history/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const history = await Result.find({ email })
      .sort({ date: -1 });

    res.json(history);

  } catch (error) {
    res.status(500).json({ error: "Error fetching history" });
  }
});


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


app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (!user.password) {
      return res.status(500).json({ message: "User password missing in DB" });
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

app.listen(5001, () => {
  console.log("Node server running on http://localhost:5001");
});

