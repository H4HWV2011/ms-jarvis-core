const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// --- Exact CORS setup ---
const allowedOrigins = [
  'https://ms.jarvis.mountainshares.us',
  'http://localhost:3000',
  'http://localhost:4000'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow server-to-server/curl
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed from this origin'), false);
  }
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Health check endpoint ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: Date.now() });
});

// (Add other endpoints here—like /mountainshares/ecosystem-status)

module.exports = app;
