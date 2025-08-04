// api/chat-with-mountainshares-brain.js
const agents = require('../backendlib/brain/agents');

const KNOWN_PERSONAS = {
  technical: true,
  creative: true,
  spiritual: true,
  emotional: true,
  mountainshares: true,
  chatbot: true, // <-- 6th persona!
};

module.exports = async (req, res) => {
  // --- CORS and browser OPTIONS preflight ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // --- POST only ---
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // --- Read POST body ---
  let body = '';
  await new Promise(resolve => {
    req.on('data', chunk => { body += chunk; });
    req.on('end', resolve);
  });

  // --- Parse JSON and find persona ---
  let message, persona;
  try {
    const data = JSON.parse(body);
    message = data.message;
    persona = (data.persona || 'mountainshares').toLowerCase();
    if (!message) throw new Error('Missing message');
  } catch (err) {
    res.status(400).json({ error: 'Invalid input', details: err.toString() });
    return;
  }

  // --- Only allow known agent personas ---
  if (!KNOWN_PERSONAS[persona]) {
    res.status(400).json({
      error: `Unknown persona: ${persona}. Supported: ${Object.keys(KNOWN_PERSONAS).join(', ')}`
    });
    return;
  }

  const agent = agents[persona];
  if (!agent || typeof agent.analyze !== 'function') {
    res.status(500).json({ error: `Agent for ${persona} is not available or missing analyze()` });
    return;
  }

  // --- Run agent and give always-friendly reply ---
  try {
    const result = await agent.analyze(message);
    let textReply = result && typeof result === 'object' ? result.reply : result;
    if (!textReply)
      textReply = "I'm your Appalachian AI, always here for a chat—just ask away!";
    res.status(200).json({ reply: textReply });
  } catch (err) {
    res.status(500).json({ error: 'Agent error', details: err.toString() });
  }
};
