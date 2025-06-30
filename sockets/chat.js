const Message = require("../models/Message");
const { getMoodReply } = require("../utils/moodBot");
const User = require("../models/User");
const {
  registerUser,
  removeUser,
  getUserSocket,
  getOnlineUsers,
} = require("../utils/userStore");
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

    
   const { getUserSocket } = require("../utils/userStore");
const { getMoodReply } = require("../utils/moodBot");

socket.on("sendMessage", async ({ sender, receiver, message }) => {
  console.log("📩 Incoming message data:", { sender, receiver, message });

  try {
    const receiverSocketId = getUserSocket(receiver.trim());

    const newMsg = new Message({
      sender,
      receiver,
      message,
      delivered: !!receiverSocketId,
    });

    // Save + send to receiver if online
    if (receiverSocketId) {
      newMsg.delivered = true;
      await newMsg.save();
      console.log("💾 Message saved to DB");

      io.to(receiverSocketId).emit("receiveMessage", {
        _id: newMsg._id,
        sender,
        receiver,
        message,
        timestamp: newMsg.timestamp,
      });
    } else {
      await newMsg.save();
      console.log(`⚠️ ${receiver} is offline so message stored for later`);
    }

    // Acknowledge back to sender
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

      
      const moodMatch = msgLower.match(/set mood to (\w+)/);
      let reply = "";

      if (moodMatch) {
        const newMood = moodMatch[1].toLowerCase();
        const validMoods = ["default", "funny", "angry", "motivator", "flirty", "dev"];
        if (validMoods.includes(newMood)) {
          setMood(sender, newMood);
          reply = `Mood set to '${newMood}'. Talk to me now 😉`;
        } else {
          reply = `Unknown mood. Valid moods: ${validMoods.join(", ")}`;
        }
      } else {
        const currentMood = getMood(sender);
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
