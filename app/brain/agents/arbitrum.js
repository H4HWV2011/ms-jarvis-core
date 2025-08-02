const { ethers } = require("ethers");

async function analyze(message) {
  const msg = message.toLowerCase();
  // Only respond if "arbitrum" or "sepolia" or "blockchain" is in message
  if (!msg.includes('arbitrum') && !msg.includes('sepolia') && !msg.includes('blockchain')) {
    return { confidence: 0, reply: "" };
  }
  try {
    let provider;
    if (msg.includes("arbitrum")) {
      provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_RPC_URL);
    } else if (msg.includes("sepolia")) {
      provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    } else {
      return { confidence: 0, reply: "" };
    }
    // Example: Show network, block number, etc.
    const blockNum = await provider.getBlockNumber();
    return {
      confidence: 0.95,
      reply: `I'm connected to the blockchain! Latest block on ${msg.includes('arbitrum') ? 'Arbitrum' : 'Sepolia'} is #${blockNum}.`
    };
  } catch (e) {
    return { confidence: 0.5, reply: "Sorry hun, I couldn't fetch live blockchain info just now." };
  }
}
module.exports = { analyze };
