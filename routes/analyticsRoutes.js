
const router = require("express").Router();
const Message = require("../models/Message");

router.get("/top-senders", async (req, res) => {
  try {
    const top = await Message.aggregate([
      { $group: { _id: "$sender", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    res.json(top);
  } catch (err) {
    res.status(500).json({ error: "Analytics error" });
  }
});

module.exports = router;
