# 💬 Real-Time Chat App Backend (Socket.IO + Express + MongoDB)

Welcome to the backend of a full-fledged real-time chat system — built from scratch using **Node.js**, **Express**, **MongoDB**, and **Socket.IO** 🚀

> 📢 Everything from real-time messaging to offline delivery, read receipts, and online user tracking — all without any frontend, tested purely with Socket.IO Client Tool & Postman.

---

## ⚙️ Tech Stack

- **Node.js** + **Express** – API and server logic
- **MongoDB** + **Mongoose** – Database and models
- **Socket.IO** – Real-time communication (send, receive, update)
- **Postman / Socket.IO Client Tool** – Testing APIs and events
- **Nodemon** – Dev-friendly auto-reload

---

## ✨ Features

### ✅ User Registration (Socket)
- When a user connects and sends a `"register"` event with their name, we:
  - Save their `username → socket.id` in memory
  - Broadcast their `onlineStatus` to all
  - Push any pending offline messages

### ✅ Real-Time Messaging
- Event: `"sendMessage"`
- Instantly delivers message to receiver if online
- If offline, message is stored in MongoDB (`delivered: false`)
- Auto-assigns `timestamp` and `_id`

### ✅ Offline Message Delivery
- When a user registers:
  - We query undelivered messages
  - Send them instantly to the user's socket
  - Mark them as `delivered: true`

### ✅ Read Receipts
- Event: `"messageRead"`
- When a user reads a message, we:
  - Mark message as `read: true` in DB
  - Notify sender with `"messageReadAck"` event

### ✅ Online Status Broadcast
- On register and disconnect:
  - We emit `{ user, status: "online" | "offline" }` to all clients

### ✅ REST API Endpoints

| Endpoint                | Description                          |
|-------------------------|--------------------------------------|
| `GET /api/online-users` | Lists currently online users         |
| `GET /api/messages/history?sender=A&receiver=B&limit=10&before=<timestamp>` | Chat history with pagination |

---

## 🧪 Testing Instructions

- Use **Socket.IO Client Tool** for:
  - Register: `register` → `"Mehul"`
  - Send message: `sendMessage` → `{ sender, receiver, message }`
  - Mark read: `messageRead` → `{ messageId }`

- Use **Postman** for:
  - `GET /api/online-users`
  - `GET /api/messages/history?sender=Mehul&receiver=Ankit&limit=10`

---

## 🗂️ Project Structure

<pre>chat-backend/
│
├── server.js        # Main entry point
├── sockets/
│ └── chat.js        # Socket.IO event handlers
├── models/
│ └── Message.js     # Mongoose schema for chat messages
├── config/
│ └── db.js 
├── routes/
│ └── messageRoutes.js
│ └── onlineRoute.js
│ └── statusRoutes.js
│ └── userRoutes.js      # REST API routes (history, online users)
├── utils/
│ └── userStore.js # Utility to map username ↔ socket.id
├── .gitignore
├── package.json
├── package-lock.json
└── .env # MongoDB connection URI </pre>
  
---

## 🧠 Future Ideas

- Authentication (JWT or OAuth)
- Group Chat / Chatrooms
- Media/File Support
- Rate Limiting
- Message Edit/Delete

---

## 🧑‍💻 Author

**Mehul Khanna**  
Backend Developer Intern · 2025  
Passionate about building real-time scalable systems 💻🔥

---

## ⭐️ If you like this project

Don’t forget to **star** ⭐ the repo and **fork** if you'd like to build on top of it!

