function getMoodReply(mood, msg, sender) {
  switch (mood) {
    case "funny":
      return "🤣 I'm too hilarious for this chat.";
    case "angry":
      return "Ugh. Why are you even talking to me?";
    case "motivator":
      return `Believe in yourself, ${sender}. You're unstoppable 💪`;
    case "flirty":
      return `Hey ${sender} 😏, you're looking quite... code-savvy.`;
    case "dev":
      return `RTFM, ${sender}. Or just google it like the rest of us.`;
    case "default":
    default:
      return `I'm here to help. Type 'help' to begin.`;
  }
}

module.exports = { getMoodReply };