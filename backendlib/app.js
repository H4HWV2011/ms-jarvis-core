require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

console.log("[DEBUG] backendlib/app.js start");
const brain = require('./brain');
console.log("[DEBUG] brain imported in app.js");

const allowedOrigins = [
  'https://ms.jarvis.mountainshares.us',
  'https://ms-jarvis-frontend-oz0li2540-h4hwv2011s-projects.vercel.app',
  'http://localhost:3000',
  'http://localhost:4000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed from this origin'), false);
  }
}));

app.use(express.json());

app.post('/chat-with-mountainshares-brain', async (req, res) => {
  const message = req.body.message || '';
  const userId = req.body.userId || '';
  const result = await brain.converse(message, userId);
  res.status(200).json({
    reply: result.reply,
    agent: result.agent,
    time: result.time,
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: Date.now() });
});

app.get('/test-api-alive', (req, res) => {
  res.json({ alive: true, time: Date.now() });
});

app.get('/', (req, res) => {
  res.status(200).send("Ms. Jarvis at your service darlin'!");
});

module.exports = app;

// For local development only:
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Ms. Jarvis backend running locally on port ${PORT}`);
  });
}
