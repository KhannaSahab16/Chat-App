const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const statusRoutes = require("./routes/statusRoutes");

const connectDB = require("./config/db");
const messageRoutes = require("./routes/messageRoutes");
const socketHandler = require("./sockets/chat");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});


connectDB();


app.use(cors());
app.use(express.json());


app.use("/api/messages", messageRoutes);
app.use("/api", statusRoutes);


require("./sockets/chat")(io); 

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
