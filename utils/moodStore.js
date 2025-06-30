const userMoods = {};

function setMood(username, mood) {
  userMoods[username] = mood;
}

function getMood(username) {
  return userMoods[username] || "default";
}

module.exports = { setMood, getMood };