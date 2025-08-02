const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// --- Exact CORS (Dashboard/Dev only) ---
const allowedOrigins = [
  'https://ms.jarvis.mountainshares.us',
  'http://localhost:3000',
  'http://localhost:4000'
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (ex: curl, mobile apps)
    if (!origin) return callback(null, true);
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

// --- Example ecosystem-status endpoint (optional, safe to use) ---
app.get('/mountainshares/ecosystem-status', (req, res) => {
  res.status(200).json({ status: 'ecosystem-live', time: Date.now() });
});

// (Add additional endpoints below as needed)

module.exports = app;
