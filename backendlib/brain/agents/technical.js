// Technical wisdom agent
async function analyze(message) {
  const msg = message.toLowerCase();
  const keys = ['contract','solidity','security','audit','optimization'];
  const confidence = keys.some(k => msg.includes(k)) ? 0.9 : 0.3;
  const reply = confidence > 0.5 ?
    "Check the small details, hun. Need a section reviewed?" :
    "I'm here for technical questions anytime, sweetie.";
  return { confidence, reply };
}
module.exports = { analyze };
