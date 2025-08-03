function pickWinner(agentReplies, message, userId) {
  if (!agentReplies || !agentReplies.length)
    return { name: 'None', reply: "I'm not sure how to help just yet, darlin'." };
  agentReplies.sort((a, b) => b.confidence - a.confidence);
  return agentReplies[0];
}
module.exports = { pickWinner };
