const users = {};
function getOnlineUsers() {
  return Object.keys(users);
}

function registerUser(username, socketId) {
  users[username.trim()] = socketId;
}

function removeUser(socketId) {
  for (let name in users) {
    if (users[name] === socketId) {
      delete users[name];
      return name;
    }
  }
  return null;
}

function getUserSocket(username) {
  return users[username.trim()];
}
module.exports = {
  registerUser,
  removeUser,
  getUserSocket,
  getOnlineUsers,
  users, 
};