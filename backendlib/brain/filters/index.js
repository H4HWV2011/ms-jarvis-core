function applyFilters(agentReplies) {
  return agentReplies.filter(r => r.reply && r.confidence >= 0.2);
}
module.exports = { applyFilters };
