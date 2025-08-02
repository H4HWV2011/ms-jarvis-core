const cors = require('cors');

// === BEGIN: Production-ready CORS config for Ms. Jarvis API ===
const allowedOrigins = [
  'https://ms.jarvis.mountainshares.us',                                          // Custom production domain
  'https://ms-jarvis-frontend-oz0li2540-h4hwv2011s-projects.vercel.app',          // Vercel frontend project URL (replace with your actual project's link if it changes)
  'http://localhost:3000',                                                        // Local frontend dev
  'http://localhost:4000'                                                         // Local backend dev
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
