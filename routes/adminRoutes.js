const router = require("express").Router();
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const User = require("../models/User");
const Message = require("../models/Message");

router.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

router.delete("/messages/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});
module.exports = router;