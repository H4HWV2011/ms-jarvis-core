const fs = require('fs').promises;
const path = require('path');

/**
 * MountainShares Knowledge Agent
 * Responds to any message mentioning MountainShares, contracts, governance,
 * Arbitrum, Sepolia, Solidity, or smart contract terms.
 * Answers are based on mountainshares_kb.txt (real PDF text extraction).
 */
async function analyze(message) {
  const msg = message.toLowerCase();

  // Respond ONLY if the message contains key organizational or technical terms
  if (
    !msg.includes('mountainshares') &&
    !msg.includes('contract') &&
    !msg.includes('governance') &&
    !msg.includes('arbitrum') &&
    !msg.includes('arbitrium') &&
    !msg.includes('sepolia') &&
    !msg.includes('solidity') &&
    !msg.includes('smart contract') &&
    !msg.includes('.sol')
  ) return { confidence: 0, reply: "" };

  try {
    // Read the knowledge base (contract PDF text, extracted previously)
    const kb = await fs.readFile(path.resolve(process.cwd(),
    'mountainshares_kb.txt'), 'utf-8');
    // Extract all unique words (length > 3 chars) from message
    const words = msg
      .replace(/arbitrium/gi, 'arbitrum')
      .split(/\s+/)
      .filter(w => w.length > 3);

    // Scan for all lines in the KB containing any user keywords
    const findings = kb
      .split('\n')
      .filter(line => words.some(w => line.toLowerCase().includes(w)));

    const answer = findings.length
      ? findings.slice(0, 8).join(' ').slice(0, 600) // up to 8 matching lines, max 600 chars
      : "I couldn't find details on that in my MountainShares contracts yet, sweetie.";

    return {
      confidence: 0.99,
      reply: `Here's what I found in the MountainShares docs:\n${answer}`
    };
  } catch (e) {
    return {
      confidence: 0.7,
      reply: "Couldn't search the MountainShares contract knowledge base right now."
    };
  }
}
module.exports = { analyze };
