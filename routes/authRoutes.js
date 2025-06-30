const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "secret"; // Use env in prod

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ error: "Username taken" });

  const hash = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username, password: hash });
  res.json({ message: "Registered", user: newUser.username });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Invalid username" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ id: user._id, username }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token, user: { id: user._id, username } });
});

module.exports = router;
