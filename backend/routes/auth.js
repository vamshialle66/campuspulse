const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendOTP = require("../utils/mailer.js");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const otpStore = {};

router.get("/me", auth, (req, res) => {
  res.json(req.user);
});

router.get("/admin", auth, requireRole(["admin"]), (req, res) => {
  res.json({ msg: "Admin access granted" });
});

router.get(
  "/faculty",
  auth,
  requireRole(["faculty", "admin"]),
  (req, res) => {
    res.json({ msg: "Faculty access granted" });
  }
);

// ==========================
// 🔐 LOGIN
// ==========================
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ msg: "Missing fields" });
    }

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


// ==========================
// 📩 SEND OTP
// ==========================
router.post("/send-otp", async (req, res) => {
  try {
    let { email } = req.body;
    email = email.trim().toLowerCase();

    if (!email.endsWith("@atharvacoe.ac.in")) {
      return res.status(400).json({ msg: "Invalid college email" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    await sendOTP(email, otp);

    res.json({ msg: "OTP sent" });

  } catch (err) {
    console.log("OTP ERROR:", err);
    res.status(500).json({ msg: "Failed to send OTP" });
  }
});


// ==========================
// ✅ VERIFY OTP
// ==========================
router.post("/verify-otp", async (req, res) => {
  try {
    let { email, otp, password } = req.body;
    email = email.trim().toLowerCase();

    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({ msg: "No OTP found" });
    }

    if (record.expires < Date.now()) {
      return res.status(400).json({ msg: "OTP expired" });
    }

    if (record.otp != otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }
    let role = "student";
    if (email.endsWith("@faculty.atharvacoe.ac.in")){
      role = "faculty"
    }

    const user = await User.create({
      email,
      password,
      role,
    });

    delete otpStore[email];

    res.json({ msg: "Account created" });

  } catch (err) {
    console.log("VERIFY ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/my-classes", auth, requireRole(["faculty"]), async (req, res) => {
  const classes = await Class.find({ facultyId: req.user.id });
  res.json(classes);
});


module.exports = router;
