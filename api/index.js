module.exports = (req, res) => {
  res.json({ hello: "vercel-routing-test", url: req.url, method: req.method, time: Date.now() });
};
