module.exports = (req, res) => {
  res.json({ status: "live", time: Date.now(), file: __filename });
};
