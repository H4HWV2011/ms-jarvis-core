// api/health.js
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: "ok",
    time: Date.now(),
    ai_models: ["mountainshares-docs"]
  });
};
