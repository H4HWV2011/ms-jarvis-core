const agents = require('../agents');
const judge = require('../judge');
const filters = require('../filters');

async function converse(message, userId) {
  const agentReplies = [];
  for (const agentName in agents) {
    try {
      const agent = agents[agentName];
      const res = await agent.analyze(message, userId);
      agentReplies.push({
        name: agentName,
        confidence: res.confidence || 0,
        reply: res.reply || '',
      });
    } catch { /* skip failed agent */ }
  }
  const filteredReplies = filters.applyFilters(agentReplies, message, userId);
  const bestReply = judge.pickWinner(filteredReplies, message, userId);
  return {
    reply: bestReply.reply,
    agent: bestReply.name,
    time: Date.now(),
  };
}

module.exports = { converse };
