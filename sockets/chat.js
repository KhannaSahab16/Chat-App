const Message = require("../models/Message");

const {
  registerUser,
  removeUser,
  getUserSocket,
  getOnlineUsers,
} = require("../utils/userStore");

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

    
    socket.on("sendMessage", async ({ sender, receiver, message }) => {
      console.log("📩 Incoming message data:", { sender, receiver, message });

      try {
        const receiverSocketId = getUserSocket(receiver.trim());
        const newMsg = new Message({ sender, receiver, message, delivered: !!receiverSocketId,});
        

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
      } catch (err) {
        console.error("❌ Error saving message:", err);
      }
    });

    
    socket.on("messageDelivered", async ({ messageId }) => {
      await Message.findByIdAndUpdate(messageId, { delivered: true });
      console.log(`📬 Message ${messageId} marked as delivered`);
    });

    
    socket.on("messageRead", async ({ messageId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { read: true });
        

        const updatedMsg = await Message.findById(messageId);
        const senderSocket = getUserSocket(updatedMsg.sender);

        if (senderSocket) {
          io.to(senderSocket).emit("messageReadAck", {
            _id: messageId,
            reader: updatedMsg.receiver,
            readAt: new Date(),
          });
        }

        console.log(`👁️‍🗨️ Message ${messageId} marked as read`);
      } catch (err) {
        console.error("❌ Error marking message as read:", err);
      }
    });

    
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
