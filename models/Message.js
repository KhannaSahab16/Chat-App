const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  delivered: { type: Boolean, default: false }, 
  read: { type: Boolean, default: false },      
});

module.exports = mongoose.model("Message", MessageSchema);
