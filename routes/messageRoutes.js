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
router.get("/unseen", async (req, res) => {
  const { receiver } = req.query;
  try {
    const messages = await Message.find({ receiver, seen: false });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/export", async (req, res) => {
  const { user1, user2 } = req.query;
  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ timestamp: 1 });

    res.setHeader("Content-Disposition", "attachment; filename=chat.json");
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(messages, null, 2));
  } catch (err) {
    res.status(500).json({ error: "Export failed" });
  }
});

module.exports = router;