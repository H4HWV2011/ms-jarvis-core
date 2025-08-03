const { ethers } = require("ethers");
require('dotenv').config();

async function analyze(message) {
  const msg = message.toLowerCase();
  // Only trigger on "sepolia" or "testnet"
  if (!msg.includes('sepolia') && !msg.includes('testnet')) {
    return { confidence: 0, reply: "" };
  }
  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const blockNum = await provider.getBlockNumber();
    return {
      confidence: 0.95,
      reply: `I'm live on Sepolia! Latest block is #${blockNum}. Got a contract or transaction hash you want to check?`
    };
  } catch (e) {
    return {
      confidence: 0.5,
      reply: "Sorry hun, I couldn't fetch Sepolia info just now."
    };
  }
}
module.exports = { analyze };
