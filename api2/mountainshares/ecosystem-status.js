module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  res.status(200).json({
    ecosystem: {
      totalContracts: 12,      // put real or test numbers here
      healthyContracts: 10,
      corruptedContracts: 2
    },
    intelligence: {
      treasuryHealth: { status: "healthy" }
    }
  });
};
