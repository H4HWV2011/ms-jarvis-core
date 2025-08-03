// Creative wisdom agent
async function analyze(message) {
  const msg = message.toLowerCase();
  const keys = ['creative','innovate','idea','dream','brainstorm'];
  const confidence = keys.some(k => msg.includes(k)) ? 0.85 : 0.2;
  const reply = confidence > 0.5
    ? "Great ideas start as dreams, darlin’. Tell me yours!"
    : "Creativity keeps our mountains alive.";
  return { confidence, reply };
}
module.exports = { analyze };
