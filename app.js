const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// === BEGIN: Production-ready CORS config for Ms. Jarvis API ===
const allowedOrigins = [
  'https://ms.jarvis.mountainshares.us',
  'https://ms-jarvis-frontend-oz0li2540-h4hwv2011s-projects.vercel.app',
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
// === END CORS ===

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: Date.now() });
});

// --- Ecosystem status endpoint
app.get('/mountainshares/ecosystem-status', (req, res) => {
  res.status(200).json({ status: 'ecosystem-live', time: Date.now() });
});

// --- Modular Council-of-Agents brain logic ---
const brain = require('./app/brain'); // Uses mother/orchestrator

app.post('/chat-with-mountainshares-brain', async (req, res) => {
  const message = req.body.message || '';
  const userId = req.body.userId || '';
  const result = await brain.converse(message, userId);

  res.status(200).json({
    reply: result.reply,
    agent: result.agent,
    time: result.time
  });
});

// --- Friendly root endpoint ---
app.get('/', (req, res) => {
  res.status(200).send("Ms. Jarvis at your service darlin'!");
});

module.exports = app;
