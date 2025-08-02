const express = require('express');
const cors = require('cors');
const app = express();

// Configure CORS to allow your Vercel frontend
const corsOptions = {
  origin: [
    'https://ms.jarvis.mountainshares.us',
    'https://ms-jarvis-frontend-4tse6jzpv-h4hwv2011s-projects.vercel.app',
    /^https:\/\/ms-jarvis-frontend-.*\.vercel\.app$/,
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests
app.options('*', cors(corsOptions));

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    brain_status: 'active',
    dependencies: {
      database: 'connected',
      ai_model: 'loaded'
    }
  };
  res.status(200).json(healthcheck);
});

// Your existing chat endpoint (replace with your actual implementation)
app.post('/chat', (req, res) => {
  const { message, userId } = req.body;
  
  // Your existing chat logic here
  res.json({
    response: "Chat endpoint working with CORS",
    timestamp: Date.now()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Ms. Jarvis API server running on port ${PORT}`);
});
