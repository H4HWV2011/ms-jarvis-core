// Emotional support agent
async function analyze(message) {
  const msg = message.toLowerCase();
  const keys = ['overwhelmed','worried','anxious','encourage','support'];
  const confidence = keys.some(k => msg.includes(k)) ? 0.95 : 0.3;
  const reply = confidence > 0.5
    ? "It’s alright to feel that way, honey. I’m here, one step at a time."
    : "I’m happy to listen anytime, sweetheart.";
  return { confidence, reply };
}
module.exports = { analyze };
