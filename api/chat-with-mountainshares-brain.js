// api/chat-with-mountainshares-brain.js
// Full AI Brain Module Integration for Ms. Jarvis - Mount Hope, WV
// Enhanced with Cultural Intelligence and GPS Processing

const brain = require('../backendlib/brain');

module.exports = async (req, res) => {
  try {
    // Set CORS headers immediately
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      console.log('🔧 OPTIONS preflight handled successfully');
      return res.status(200).end();
    }

    // Only accept POST
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed',
        allowedMethods: ['POST', 'OPTIONS']
      });
    }

    // Safe JSON parsing
    let body = {};
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch (parseError) {
        return res.status(400).json({
          error: 'Invalid JSON',
          reply: "Well honey, I couldn't understand the format of your message. Please try again, darlin'!",
          agent: "Ms. Jarvis",
          time: Date.now()
        });
      }
    } else {
      body = req.body || {};
    }

    const { message, userId } = body;

    // Validate message
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message required',
        reply: "I need a message to help you, darlin'!",
        agent: "Ms. Jarvis",
        time: Date.now()
      });
    }

    console.log(`🏔️ Ms. Jarvis processing with full brain: ${message.substring(0, 50)}...`);

    // Extract request metadata for GPS and cultural processing
    const requestMetadata = {
      userAgent: req.headers['user-agent'],
      origin: req.headers.origin,
      referer: req.headers.referer,
      clientIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      timestamp: Date.now()
    };

    // Call the full brain module with cultural intelligence
    const brainResponse = await brain.converse(message, userId || 'anonymous', requestMetadata);

    // Enhanced response with full AI capabilities
    return res.status(200).json({
      ...brainResponse,
      agent: "Ms. Jarvis",
      time: Date.now(),
      processingMode: "full_ai_brain_with_cultural_intelligence",
      source: "Mount Hope, WV"
    });

  } catch (error) {
    console.error('🚨 Ms. Jarvis brain error:', error.message);

    // Graceful fallback to emergency response if brain fails
    return res.status(500).json({
      error: 'AI processing error',
      reply: "Well, sugar, I'm having a little trouble with my thinking right now. Let me try that again for you, honey child! 💖",
      agent: "Ms. Jarvis",
      time: Date.now(),
      consultation: {
        specialists: ["emergency_fallback"],
        confidence: "medium",
        processingMode: "error_recovery",
        processingTime: 0,
        fallbackReason: error.message
      }
    });
  }
};
