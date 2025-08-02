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
