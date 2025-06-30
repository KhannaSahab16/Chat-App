const Message = require("../models/Message");
const User = require("../models/User");
const {
  registerUser,
  removeUser,
  getUserSocket,
  getOnlineUsers,
} = require("../utils/userStore");
const { getMoodReply } = require("../utils/moodBot");
const { updateLastActive, getIdleTime } = require("../utils/lastActiveStore");
const botQuotes = require("../utils/botQuotes.json");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    
    socket.on("register", async (username) => {
  try {
    username = username.trim();
    registerUser(username, socket.id);
    console.log(`✅ Registered: ${username} → ${socket.id}`);
    io.emit("onlineStatus", { user: username, status: "online" });
    console.log(`🟢 ${username} is now online`);

    
    const undelivered = await Message.find({
      receiver: username,
      delivered: false,
    });

    console.log(`🧠 Found ${undelivered.length} undelivered messages for ${username}`);

   
    for (const msg of undelivered) {
      io.to(socket.id).emit("receiveMessage", {
        _id: msg._id,
        sender: msg.sender,
        receiver: msg.receiver,
        message: msg.message,
        timestamp: msg.timestamp,
      });

      console.log(`📤 Sent undelivered message from ${msg.sender}: ${msg.message}`);

      
      await Message.findByIdAndUpdate(msg._id, { delivered: true });
    }

    
    

  } catch (error) {
    console.error(`❌ Error in register handler for ${username}:`, error);
  }
});




function getRandomQuoteOrJoke(type, lang = "english") {
  const items = botQuotes?.[lang]?.[type] || botQuotes.english[type];
  return items[Math.floor(Math.random() * items.length)];
}

socket.on("sendMessage", async ({ sender, receiver, message }) => {
  console.log("📩 Incoming message data:", { sender, receiver, message });

  try {
    
    updateLastActive(sender);
    const idleTime = getIdleTime(sender);
    const isIdle = idleTime > 1000 * 60 * 5; // > 5 mins

    const receiverSocketId = getUserSocket(receiver.trim());

    const newMsg = new Message({
      sender,
      receiver,
      message,
      delivered: !!receiverSocketId,
    });

    if (receiverSocketId) {
      newMsg.delivered = true;
      await newMsg.save();
      io.to(receiverSocketId).emit("receiveMessage", {
        _id: newMsg._id,
        sender,
        receiver,
        message,
        timestamp: newMsg.timestamp,
      });
    } else {
      await newMsg.save();
      console.log(`⚠️ ${receiver} is offline so message stored`);
    }

    socket.emit("message-sent", {
      _id: newMsg._id,
      receiver,
      message,
      timestamp: newMsg.timestamp,
    });

    if (receiverSocketId) {
      io.to(socket.id).emit("message-delivered", {
        messageId: newMsg._id,
        receiver,
      });
    }

    
    if (receiver.toLowerCase() === "bot") {
      const msgLower = message.toLowerCase().trim();
      let reply = "";

      
      const userDoc = await User.findOne({ username: sender });
      const currentMood = userDoc?.mood || "default";
      const language = userDoc?.language || "english";

      
      const moodMatch = msgLower.match(/set mood to (\w+)/);
      if (moodMatch) {
        const newMood = moodMatch[1].toLowerCase();
        const validMoods = ["default", "funny", "angry", "motivator", "flirty", "dev"];
        if (validMoods.includes(newMood)) {
          await User.findOneAndUpdate({ username: sender }, { mood: newMood });
          reply = `Mood set to '${newMood}'. Talk to me now 😉`;
        } else {
          reply = `Unknown mood. Valid moods: ${validMoods.join(", ")}`;
        }
      }

      
      else if (msgLower.match(/set language to (\w+)/)) {
        const lang = msgLower.match(/set language to (\w+)/)[1].toLowerCase();
        if (["english", "hindi"].includes(lang)) {
          await User.findOneAndUpdate({ username: sender }, { language: lang });
          reply = `Language set to '${lang}'.`;
        } else {
          reply = `Unknown language. Options: english, hindi`;
        }
      }

      
      else if (isIdle) {
        reply = `Back from the dead huh ${sender}? You idle coder 😴`;
      }

      
      else if (msgLower.includes("joke")) {
        reply = getRandomQuoteOrJoke("jokes", language);
      } else if (msgLower.includes("quote")) {
        reply = getRandomQuoteOrJoke("quotes", language);
      }

      
      else {
        reply = getMoodReply(currentMood, msgLower, sender);
      }

      
      setTimeout(async () => {
        const botMsg = new Message({
          sender: "Bot",
          receiver: sender,
          message: reply,
          delivered: true,
        });
        await botMsg.save();

        const senderSocketId = getUserSocket(sender);
        if (senderSocketId) {
          io.to(senderSocketId).emit("receiveMessage", {
            _id: botMsg._id,
            sender: "Bot",
            receiver: sender,
            message: reply,
            timestamp: botMsg.timestamp,
          });
        }
      }, 1000);
    }
  } catch (err) {
    console.error("❌ Error saving message:", err);
  }
});


    
    socket.on("messageDelivered", async ({ messageId }) => {
      await Message.findByIdAndUpdate(messageId, { delivered: true });
      console.log(`📬 Message ${messageId} marked as delivered`);
    });
    socket.on("typing", ({ to }) => {
  const receiverSocket = getUserSocket(to);
  if (receiverSocket) {
    io.to(receiverSocket).emit("typing", { from: userId });
  }
});

socket.on("stop-typing", ({ to }) => {
  const receiverSocket = getUserSocket(to);
  if (receiverSocket) {
    io.to(receiverSocket).emit("stop-typing", { from: userId });
  }
});

    
//     socket.on("messageSeen", async ({ sender, receiver }) => {
//   try {
//     const updated = await Message.updateMany(
//       { sender, receiver, seen: false },
//       { $set: { seen: true } }
//     );

//     console.log(`👁️ Marked ${updated.modifiedCount} messages as seen from ${sender} to ${receiver}`);

//     const senderSocket = getUserSocket(sender);
//     if (senderSocket) {
//       io.to(senderSocket).emit("seenAck", {
//         sender,
//         receiver,
//         seenAt: new Date(),
//       });
//     }
//   } catch (err) {
//     console.error("❌ Error marking messages as seen:", err);
//   }
// });
    
    socket.on("disconnect", () => {
      const disconnectedUser = removeUser(socket.id);

      if (disconnectedUser) {
        console.log(`❌ Disconnected: ${disconnectedUser}`);
        io.emit("onlineStatus", {
          user: disconnectedUser,
          status: "offline",
        });
      }
    });
  });
};
