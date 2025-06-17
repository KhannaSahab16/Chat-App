const express = require("express");
const router = express.Router();
const Message = require("../models/Message");


router.get("/history", async (req, res) => {
  const { user1, user2, limit = 20, before } = req.query;

  if (!user1 || !user2) {
    return res.status(400).json({ error: "Missing user1 or user2" });
  }

  const beforeDate = before ? new Date(before) : new Date();

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
      timestamp: { $lt: beforeDate },
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    const hasMore = messages.length === parseInt(limit);

    res.json({
      messages,
      nextBefore: hasMore ? messages[messages.length - 1].timestamp : null,
      hasMore,
    });
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ error: "Server error while fetching chat history" });
  }
});
router.get("/undelivered", async (req, res) => {
  const { receiver } = req.query;
  if (!receiver) return res.status(400).json({ error: "Missing receiver" });

  try {
    const messages = await Message.find({ receiver, delivered: false });
    res.json(messages);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/unread", async (req, res) => {
  const { receiver } = req.query;
  try {
    const messages = await Message.find({ receiver, read: false });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;