const express = require('express');
const cors = require('cors');
const app = express();

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = [
      'https://ms.jarvis.mountainshares.us',
      'https://ms-jarvis-frontend-4tse6jzpv-h4hwv2011s-projects.vercel.app',
      'http://localhost:3000',
      'http://localhost:4000',
      'http://localhost:5173'
    ];
    const vercelPattern = /^https:\/\/ms-jarvis-frontend-.*\.vercel\.app$/;
    if (allowed.includes(origin) || vercelPattern.test(origin)) return callback(null, true);
    return callback(new Error('CORS policy: This origin is not allowed'), false);
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.get('/health', (req, res) => {
  res.json({status: 'ok', time: Date.now()});
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`MsJarvis minimal API running on port ${PORT}`);
});
