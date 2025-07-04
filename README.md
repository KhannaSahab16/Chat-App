# 💬 Real-Time Chat App Backend (Socket.IO + Express + MongoDB)

Welcome to the backend of a full-fledged real-time chat system — built from scratch using **Node.js**, **Express**, **MongoDB**, and **Socket.IO** 🚀

> 📢 From real-time messaging, offline delivery, read receipts, profile editing, admin tools, and even a chatbot — this backend is loaded.  
> ✅ Tested purely with Postman & Socket.IO Client Tool — no frontend needed.

---

## ⚙️ Tech Stack

- **Node.js** + **Express** – API and server logic
- **MongoDB** + **Mongoose** – Database and models
- **Socket.IO** – Real-time messaging, delivery, typing, read events
- **Postman** + **Socket.IO Client Tool** – API and event testing
- **JWT Auth** – Secure user endpoints
- **Nodemon** – Auto-reload during dev

---

## ✨ Features

### ✅ Auth (JWT)
- `POST /register` – New user registration
- `POST /login` – Login and receive JWT token
- JWT-protected routes for profile and admin

---

### ✅ Real-Time Chat Engine

#### 🔌 `register`
- On socket connect, emit `register`
- Backend:
  - Stores `username ↔ socketId` in memory
  - Marks user as **online**
  - Pushes **undelivered messages**

#### 💬 `sendMessage`
- Instantly delivers if receiver online
- Saves to DB regardless
- Handles `delivered` status

#### 📤 Offline Delivery
- When a user connects:
  - All `delivered: false` messages are pushed
  - Status updated in DB

#### 👁️ `messageSeen`
- Mark messages as `seen: true`
- Notifies original sender via `seenAck` event

#### ✍️ Typing Indicators
- `typing` and `stop-typing` events supported

---

### 📡 Online Status

- Emits `onlineStatus` updates to all users
- `GET /api/users/online` returns list of active users

---

### 🤖 Auto-Reply Bot (Fun Feature)
- Send messages to **Bot** like:
  - `"hello"`, `"who are you"`, `"joke"`, `"bye"`
- Bot responds with hardcoded replies

---

### 🔐 Admin Panel Features

JWT role-based admin with these routes:

| Route                        | Description                       |
|------------------------------|-----------------------------------|
| `DELETE /admin/users/:id`    | Delete any user                   |
| `DELETE /admin/messages/:id` | Delete any message                |
| `POST /admin/freeze/:id`     | Freeze a user (disable sending)   |
| `POST /admin/unfreeze/:id`   | Unfreeze a user                   |

---

### 🧾 Profile Management

- `GET /api/users/profile/me` – Get your profile
- `PUT /api/users/profile/me` – Edit bio or avatar
- `GET /api/users/profile/:username` – View others' profiles
- `GET /api/users/` – List all users (except self)

---

### 📊 Analytics & Export

- `GET /api/messages/analytics`  
  → Returns:
  ```json
  {
    "totalMessages": 145,
    "delivered": 140,
    "seen": 100,
    "undelivered": 5
  }
  ```

- `GET /api/messages/export`  
  → Download all your messages in `.txt` format

---

## 🧪 Testing Instructions

**Socket.IO Client Tool**:
- Emit `register` → `"mehul"`
- Emit `sendMessage` → `{ sender, receiver, message }`
- Emit `messageSeen` → `{ sender, receiver }`
- Emit `typing` → `{ to }`, then `stop-typing`

**Postman**:
- Auth: `POST /register`, `POST /login`
- Protected routes (use Bearer token in header):
  - `GET /api/users/`
  - `GET /api/users/profile/me`
  - `PUT /api/users/profile/me`
  - `GET /api/messages/history?user1=A&user2=B`
  - Admin routes (`/admin/...`)
  - Bot via regular `sendMessage` with `receiver: "Bot"`

---

## 🗂️ Project Structure

```
chat-backend/
├── server.js
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   └── Message.js
├── routes/
│   ├── messageRoutes.js
│   ├── userRoutes.js
│   ├── statusRoutes.js
│   ├── adminRoutes.js
│   └── onlineRoute.js
├── sockets/
│   └── chat.js
├── utils/
│   └── userStore.js
├── middleware/
│   └── auth.js
├── .env
├── package.json
└── README.md
```

---

## 🧑‍💻 Author

**Mehul Khanna**  
Backend Developer Intern · 2025  
Passionate about building real-time scalable systems 💻🔥

---

## ⭐️ If you like this project

Don’t forget to **star** ⭐ the repo and **fork** if you'd like to build on top of it!
