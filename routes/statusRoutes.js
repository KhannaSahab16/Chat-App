const express = require("express");
const router = express.Router();
const { users } = require("../utils/userStore"); 

router.get("/status", (req, res) => {
  const user = req.query.user?.trim();
  if (!user) return res.status(400).json({ error: "Missing user param" });

  const isOnline = !!users[user];
  res.json({ user, online: isOnline });
});

router.get("/online-users", (req, res) => {
  res.json({ onlineUsers: Object.keys(users) });
});

module.exports = router;
