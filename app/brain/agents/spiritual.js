// Spiritual wisdom agent
async function analyze(message) {
  const msg = message.toLowerCase();
  const keys = ['god','faith','spiritual','biblical','prayer'];
  const confidence = keys.some(k => msg.includes(k)) ? 0.9 : 0.2;
  const reply = confidence > 0.5 ?
    "Faith guides us through, dear. Got a verse on your heart?" :
    "Spiritual wisdom always has a place here.";
  return { confidence, reply };
}
module.exports = { analyze };
