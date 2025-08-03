console.log("[DEBUG] mother.js start");
// Mother orchestrator: calls all agents, runs filters, calls judge
const agents = require('../agents');
console.log("[DEBUG] agents loaded in mother");
const judge = require('../judge');
console.log("[DEBUG] agents loaded in mother");
const filters = require('../filters');
console.log("[DEBUG] agents loaded in mother");

async function converse(message, userId) {
  const agentReplies = [];
  for (const agentName in agents) {
    try {
      const agent = agents[agentName];
      const res = await agent.analyze(message, userId);
      agentReplies.push({
        name: agentName,
        confidence: res.confidence || 0,
        reply: res.reply || ''
      });
    } catch { /* skip failed agent */ }
  }
  const filteredReplies = filters.applyFilters(agentReplies, message, userId);
  const bestReply = judge.pickWinner(filteredReplies, message, userId);
  return {
    reply: bestReply.reply,
    agent: bestReply.name,
    time: Date.now()
  };
}

module.exports = { converse };
