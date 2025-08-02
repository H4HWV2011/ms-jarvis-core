const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = [
      'https://ms.jarvis.mountainshares.us',
      'http://localhost:3000',
      'http://localhost:4000'
    ];
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: Not allowed'), false);
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Health check endpoint ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: Date.now() });
});

// (Add additional endpoints below as needed)

module.exports = app;
