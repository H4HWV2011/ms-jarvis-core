const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// === BEGIN: Production-ready CORS config for Ms. Jarvis API ===
const allowedOrigins = [
  'https://ms.jarvis.mountainshares.us',                                         // Custom production domain
  'https://ms-jarvis-frontend-oz0li2540-h4hwv2011s-projects.vercel.app',         // Vercel frontend project URL (add new Vercel URLs as needed)
  'http://localhost:3000',                                                       // Local frontend dev
  'http://localhost:4000'                                                        // Local backend dev
];
// You may add more preview or frontend URLs as needed, one per line

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

// --- Contextual brain logic ---
const { detectQueryType, generateContextualResponse } = require('./app/query_enhancer');

app.post('/chat-with-mountainshares-brain', (req, res) => {
  const message = req.body.message || '';
  const userId = req.body.userId || '';
  const queryType = detectQueryType(message);
  const context = generateContextualResponse(queryType, message, userId);

  res.status(200).json({
    reply: context.response_template,
    info: {
      detectedType: queryType,
      focus: context.focus,
      agent: context.agent_emphasis,
      tone: context.tone
    },
    time: Date.now()
  });
});

// --- Friendly root endpoint ---
app.get('/', (req, res) => {
  res.status(200).send("Ms. Jarvis at your service darlin'!");
});

module.exports = app;
