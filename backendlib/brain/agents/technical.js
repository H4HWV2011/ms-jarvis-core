const { ethers } = require('ethers');

function parseAbi(str) {
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

async function analyze(message) {
  const msg = (message || "").toLowerCase();
  if (msg.includes('deploy')) {
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    const privateKey = process.env.DEVELOPER_PRIVATE_KEY;
    const abiText = process.env.CONTRACT_ABI;
    const bytecode = process.env.CONTRACT_BYTECODE;

    // Debug log for config
    console.log("TECH AGENT: SEPOLIA_RPC_URL =", rpcUrl ? '✓' : 'MISSING');
    console.log("TECH AGENT: DEVELOPER_PRIVATE_KEY =", privateKey ? '✓' : 'MISSING');
    console.log("TECH AGENT: CONTRACT_ABI =", abiText ? '✓' : 'MISSING');
    console.log("TECH AGENT: CONTRACT_BYTECODE =", bytecode ? '✓' : 'MISSING');

    if (!rpcUrl || !privateKey || !abiText || !bytecode)
      return { confidence: 0.92, reply: "Missing contract config (.env)! Double-check SEPOLIA_RPC_URL, PRIVATE_KEY, CONTRACT_ABI, and BYTECODE, darlin'." };

    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      const abi = parseAbi(abiText);
      if (!abi.length)
        return { confidence: 0.91, reply: "ABI is empty or invalid JSON, darlin'. Please fix CONTRACT_ABI in .env!" };

      const factory = new ethers.ContractFactory(abi, bytecode, wallet);
      const contract = await factory.deploy(/* constructor args here */);

      await contract.deploymentTransaction().wait();
      return {
        confidence: 0.98,
        reply: `Contract deployed! Address: ${contract.target || contract.address}`
      };
    } catch (err) {
      return {
        confidence: 0.95,
        reply: "Tried to deploy, darlin', but hit an error: " + (err && err.message ? err.message : err.toString())
      };
    }
  }

  // Default technical wisdom
  return {
    confidence: 0.2,
    reply: "I'm here for technical questions anytime, sweetie."
  };
}

module.exports = { analyze };
