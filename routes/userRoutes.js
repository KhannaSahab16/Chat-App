const router = require("express").Router();
const User = require("../models/User");
const verifyToken = require("../middleware/auth");
const { getOnlineUsers } = require("../utils/userStore");


router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select(
      "username bio avatar"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


router.get("/online", (req, res) => {
  const online = getOnlineUsers();
  res.json({ online });
});


router.get("/profile/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});


router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "username bio avatar"
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});


router.put("/profile/me", verifyToken, async (req, res) => {
  const { bio, avatar } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bio, avatar },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
