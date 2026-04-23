const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// optional but useful
transporter.verify((err, success) => {
  if (err) {
    console.log("Mail server error:", err);
  } else {
    console.log("Mail server ready");
  }
});

const sendOTP = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"CampusPulse" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your OTP for CampusPulse",
      text: `Your OTP is ${otp}`,
      html: `<h2>Your OTP is: ${otp}</h2>`, // better UX
    });
  } catch (err) {
    console.log("Email send error:", err);
    throw err; // let route handle it
  }
};

module.exports = sendOTP;
