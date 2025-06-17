const router = require("express").Router();

// This will only work if we export `users` from sockets
const { getOnlineUsers } = require("../utils/userStore");

router.get("/online", (req, res) => {
  const online = getOnlineUsers();
  res.json({ online });
});

module.exports = router;
