const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" } ,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  mood: { type: String, default: "default" },
language: { type: String, enum: ["english", "hindi"], default: "english" },
});

module.exports = mongoose.model("User", UserSchema);
