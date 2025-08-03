module.exports = (req, res) => {
  res.json({ test: "working", time: Date.now() });
};
