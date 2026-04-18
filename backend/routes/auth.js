const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");


// ✅ REGISTER (FINAL FIXED)
router.post("/register", async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ msg: "All fields required" });
    }

    // 🔥 normalize email
    email = email.trim().toLowerCase();

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const newUser = new User({
      email,
      password,
      role: "student",
    });

    await newUser.save();

    res.json({ msg: "User created successfully" });

  } catch (err) {

    // 🔥 HANDLE DUPLICATE ERROR FROM DB
    if (err.code === 11000) {
      return res.status(400).json({ msg: "User already exists" });
    }

    console.log("REGISTER ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


// ✅ LOGIN (CLEAN + CORRECT)
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    // 🔥 normalize email
    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secret"
    );

    res.json({
      token,
      role: user.role,
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;