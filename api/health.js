// api/health.js
module.exports = (req, res) => {
  // Enhanced CORS headers
  const allowedOrigins = [
    'http://localhost:3000',
    'https://ms.jarvis.mountainshares.us',
    'https://ms-jarvis-frontend-jh3d2y03z-h4hwv2011s-projects.vercel.app'
  ];
  
  const origin = req.headers.origin;
  const isAllowedOrigin = allowedOrigins.includes(origin);
  
  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    console.log('🔧 Health OPTIONS preflight from:', origin);
    res.status(200).end();
    return;
  }
  
  res.status(200).json({
    status: "ok",
    message: 'Ms. Jarvis API is healthy and ready',
    timestamp: new Date().toISOString(),
    service: 'Ms. Jarvis API - Mount Hope, WV',
    version: '1.0.0',
    time: Date.now(),
    ai_models: ["mountainshares-docs"]
  });
};
