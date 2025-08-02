const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const allowedOrigins = [
  'https://ms.jarvis.mountainshares.us',
  'http://localhost:3000',
  'http://localhost:4000'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow curl/server-to-server
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed from this origin'), false);
  }
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: Date.now() });
});

app.get('/mountainshares/ecosystem-status', (req, res) => {
  res.status(200).json({ status: 'ecosystem-live', time: Date.now() });
});

// --- Chat-with-mountainshares-brain endpoint ---
app.post('/chat-with-mountainshares-brain', (req, res) => {
  const userMessage = req.body.message || "";
  res.status(200).json({
    reply: `You said: "${userMessage}"`,
    time: Date.now()
  });
});

module.exports = app;
