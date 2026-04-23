// middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ msg: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "secret");
    req.user = decoded; // 🔥 important
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};
