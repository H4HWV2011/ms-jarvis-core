const agents = require('../backendlib/brain/agents');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  let body = '';
  await new Promise(resolve => {
    req.on('data', chunk => { body += chunk; });
    req.on('end', resolve);
  });

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

  const agent = agents[persona];
  if (!agent || !agent.analyze) {
    res.status(400).json({ error: `Unknown persona: ${persona}` });
    return;
  }

  try {
    const reply = await agent.analyze({ message, persona });
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Agent error', details: err.toString() });
  }
};
