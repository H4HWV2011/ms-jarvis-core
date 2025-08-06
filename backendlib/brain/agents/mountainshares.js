// MountainShares agent: core wisdom only, zero error, no blockchain or PDF calls

async function analyze(message) {
  const msg = (message || "").toLowerCase();

  // If user asks about MountainShares, deliver core wisdom reply
  if (msg.includes('mountainshares')) {
    return {
      confidence: 0.95,
      reply: (
        "MountainShares is a community-focused project dedicated to sustainable economic growth and technological innovation in Appalachia and beyond. " +
        "Ask me about our mission, the team, how our community works, or the principles at the heart of MountainShares. " +
        "For technical contract details, please provide a specific question!"
      )
    };
  }

  // If the message isn't about MountainShares, do nothing (fallback for orchestrator)
  return { confidence: 0.1, reply: null };
}

module.exports = { analyze };
