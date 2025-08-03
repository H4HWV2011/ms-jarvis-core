module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  res.status(200).json({
    status: "ok",
    time: Date.now(),
    ai_models: ["mountainshares-docs"] // or however many/what you want to show
  });
};
