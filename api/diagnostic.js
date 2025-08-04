// api/diagnostic.js
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ status: "live", time: Date.now(), file: __filename });
};
