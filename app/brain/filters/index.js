// Filters for agent replies; can add safety/ethics/spiritual logic here.
function applyFilters(agentReplies, message, userId) {
  return agentReplies.filter(r => r.reply && r.confidence >= 0.2);
}
module.exports = { applyFilters };
