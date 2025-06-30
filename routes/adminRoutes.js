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

router.put("/freeze-user", verifyToken, verifyAdmin, async (req, res) => {
  const { username } = req.body;

  if (!username) return res.status(400).json({ error: "Username required" });

  try {
    const user = await User.findOneAndUpdate(
      { username },
      { frozen: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: `❄️ User '${username}' has been frozen.` });
  } catch (err) {
    res.status(500).json({ error: "Server error while freezing user" });
  }
});

module.exports = router;