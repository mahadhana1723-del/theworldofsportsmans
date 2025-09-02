// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const API_URL = "http://localhost:5000";


const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());
const corsOptions = {
  origin: [
    "http://localhost:5000",                   // local dev
    "http://127.0.0.1:5500",                   // VSCode Live Server (if you use it)
    "https://mahadhana1723-del.github.io"      // your GitHub Pages site
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));


// ✅ connect MongoDB
mongoose.connect(process.env.MONGO_URI, )

  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ Mongo error:", err));

  const SECRET = process.env.JWT_SECRET ||"supersecretkey";


// ✅ User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

// ✅ Register API
app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ msg: "Missing fields" });

    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();

    res.json({ msg: "Account created successfully" });
  } catch (err) {
  console.error("Signup error:", err);
  res.status(500).json({ msg: "Server error", error: err.message });
}
});

// ✅ Login API with JWT
app.post("/api/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ msg: "Invalid credentials" });

    // 🔑 create JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, SECRET, { expiresIn: "1h" });

    res.json({
      msg: "Login successful",
      token,
      user: { username: user.username, email: user.email }
    });
  }  catch (err) {
  console.error("Signin error:", err);
  res.status(500).json({ msg: "Server error", error: err.message });
}
});


// ✅ Middleware to protect routes
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ msg: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ msg: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// ✅ Example protected route
app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({ msg: "Welcome back!", user: req.user });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
