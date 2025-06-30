const lastActive = {};

function updateLastActive(username) {
  lastActive[username] = Date.now();
}

function getIdleTime(username) {
  const last = lastActive[username] || 0;
  return Date.now() - last;
}

module.exports = { updateLastActive, getIdleTime };