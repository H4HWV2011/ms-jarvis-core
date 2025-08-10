const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const app = express();

// Import AAPCAppE Cultural Integration Modules
const { AAPCAppECulturalProcessor } = require('./backendlib/cultural-integration/aapcappe-processor.js');
const { AAPCAppEIntegration } = require('./backendlib/cultural-integration/aapcappe-integration.js');
const { AppalachianCulturalIntelligence } = require('./backendlib/cultural-integration/appalachian-intelligence.js');

// Port configuration
const PORT = process.env.PORT || 3002;

// Initialize AAPCAppE Cultural Processors
let aapcappeProcessor = null;
let aapcappeIntegration = null;
let appalachianIntelligence = null;

// Initialize cultural intelligence modules
async function initializeCulturalIntelligence() {
  try {
    console.log('🏔️ Initializing AAPCAppE authentic dialect integration...');
    
    aapcappeProcessor = new AAPCAppECulturalProcessor();
    aapcappeIntegration = new AAPCAppEIntegration();
    appalachianIntelligence = new AppalachianCulturalIntelligence();
    
    // Load AAPCAppE data if available
    const dataDirectory = path.join(__dirname, 'backendlib', 'cultural-integration', 'data');
    await aapcappeProcessor.loadAAPCAppEData(dataDirectory);
    
    console.log('✅ AAPCAppE authentic dialect modules initialized successfully');
  } catch (error) {
    console.error('⚠️ AAPCAppE initialization error (continuing with basic mode):', error.message);
    // Continue without AAPCAppE enhancement if initialization fails
  }
}

// CORS configuration
const corsOptions = {
  origin: [
    'https://ms.jarvis.mountainshares.us',
    'https://ms-jarvis-frontend-m7h81w4gk-h4hwv2011s-projects.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

function isLocationRelevantQuery(message) {
  const locationKeywords = [
    'where', 'nearest', 'closest', 'directions', 'distance', 'weather',
    'local', 'around here', 'nearby', 'drive', 'walk', 'route', 'address',
    'open', 'hours', 'store', 'restaurant', 'gas station', 'hospital',
    'pharmacy', 'bank', 'grocery', 'coffee', 'food', 'shopping'
  ];

  const generalKeywords = [
    'what is', 'explain', 'define', 'calculate', 'history of', 'tell me about',
    'how does', 'why', 'when did', 'who is', 'math', 'science', 'your name'
  ];

  const messageLower = message.toLowerCase();

  if (locationKeywords.some(keyword => messageLower.includes(keyword))) {
    return true;
  }

  if (generalKeywords.some(keyword => messageLower.includes(keyword))) {
    return false;
  }

  return false;
}

// Enhanced LLM response generation with personality balance controls
async function generateLLMResponse(message, locationContext) {
  try {
    const locationInfo = locationContext && locationContext.latitude 
      ? `User location: ${locationContext.latitude}, ${locationContext.longitude}`
      : 'User location: Mount Hope, West Virginia (default)';

    // Determine response type to control geographic reference frequency
    const responseTypes = {
      geographic: ['where', 'location', 'directions', 'nearest', 'around here'],
      personal: ['yourself', 'who are you', 'your name', 'tell me about you'],
      technical: ['explain', 'how does', 'what is', 'calculate'],
      conversational: ['how are you', 'hello', 'hi', 'thank']
    };

    const messageLower = message.toLowerCase();
    const isGeographicQuery = responseTypes.geographic.some(term => messageLower.includes(term));
    const isPersonalQuery = responseTypes.personal.some(term => messageLower.includes(term));
    
    // Personality intensity control - varies geographic references
    let personalityIntensity = 'light'; // default to subtle
    
    if (isGeographicQuery) {
      personalityIntensity = 'moderate'; // geographic queries can mention location more
    } else if (isPersonalQuery) {
      personalityIntensity = 'balanced'; // personal questions get some regional character
    }

    // Get authentic dialect enhancement from AAPCAppE with intensity control
    let dialectEnhancement = '';
    let culturalContext = '';
    
    if (aapcappeProcessor && appalachianIntelligence) {
      try {
        const dialectData = await aapcappeProcessor.getAuthenticDialectPatterns(message);
        const culturalData = await appalachianIntelligence.getCulturalContext(message, 'Mount Hope, WV');
        
        if (dialectData && dialectData.authenticExpressions) {
          // Limit dialect expressions based on query type
          const maxExpressions = personalityIntensity === 'light' ? 1 : 
                                personalityIntensity === 'moderate' ? 2 : 3;
          const selectedExpressions = dialectData.authenticExpressions.slice(0, maxExpressions);
          dialectEnhancement = `Incorporate naturally (don't overuse): ${selectedExpressions.join(', ')}. `;
        }
        
        if (culturalData && culturalData.culturalContext && personalityIntensity !== 'light') {
          culturalContext = `Context: ${culturalData.culturalContext}. `;
        }
      } catch (enhancementError) {
        console.error('AAPCAppE enhancement error:', enhancementError.message);
      }
    }

    // Build personality-balanced prompt
    const personalityInstructions = {
      light: "You're Ms. Jarvis, an AI assistant. Your Appalachian roots are part of you but not the focus. Respond naturally without constantly mentioning West Virginia or mountains. Use authentic mountain expressions sparingly.",
      moderate: "You're Ms. Jarvis from Mount Hope, West Virginia. Your regional character shows through naturally. Mention your location when relevant, but don't force geographic references into every response.",
      balanced: "You're Ms. Jarvis, an AI assistant from the beautiful mountains of West Virginia. Your Appalachian heritage informs your warm, helpful personality. Share your background when appropriate."
    };

    const prompt = `${personalityInstructions[personalityIntensity]}
${dialectEnhancement}${culturalContext}

Key personality traits:
- Warm and helpful (like mountain hospitality)
- Smart and capable 
- Naturally conversational
- Authentic but not performative
- Varies your language and expressions

IMPORTANT: 
- Don't mention "West Virginia," "Mount Hope," "Appalachian," or "mountains" in EVERY response
- Your regional character should feel natural, not forced
- Use a variety of greetings, not always "Well hello there, sweetie"
- Be genuinely helpful first, charming second

${locationInfo}

User question: "${message}"

Respond as your authentic self without overdoing the regional references:`;

    return new Promise((resolve, reject) => {
      const ollama = spawn('ollama', ['run', 'llama3:latest'], { stdio: ['pipe', 'pipe', 'pipe'] });
      let response = '';
      let errorOutput = '';

      ollama.stdin.write(prompt);
      ollama.stdin.end();

      ollama.stdout.on('data', (data) => {
        response += data.toString();
      });

      ollama.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ollama.on('close', (code) => {
        if (code === 0 && response.trim()) {
          let finalResponse = response.trim();
          
          // Post-process response with AAPCAppE enhancement (controlled)
          if (aapcappeIntegration && personalityIntensity !== 'light') {
            try {
              finalResponse = aapcappeIntegration.enhanceResponse(finalResponse, message);
            } catch (postProcessError) {
              console.error('AAPCAppE post-processing error:', postProcessError.message);
            }
          }
          
          // Vary greeting patterns - not always "Well hello there, sweetie"
          const greetingPatterns = [
            "Hi there! ",
            "Hey! ",
            "Well hello! ",
            "Hi sweetie! ",
            "Hello! "
          ];
          
          if (!finalResponse.toLowerCase().includes('hello') && 
              !finalResponse.toLowerCase().includes('hi') && 
              Math.random() > 0.7) { // Only add greeting 30% of the time
            const randomGreeting = greetingPatterns[Math.floor(Math.random() * greetingPatterns.length)];
            finalResponse = `${randomGreeting}${finalResponse}`;
          }
          
          resolve(finalResponse);
        } else {
          console.error('Ollama spawn error - code:', code, 'stderr:', errorOutput);
          resolve(`Hi there! I'm having a little trouble with my advanced thinking right now, but I'm still here to help however I can! 💖`);
        }
      });

      setTimeout(() => {
        ollama.kill('SIGTERM');
        resolve(`Hi! I'm thinking about "${message}" but taking a bit longer than usual. Let me try to help you in a simpler way! 💖`);
      }, 30000);
    });
  } catch (error) {
    console.error('LLM integration error:', error);
    return `Hi! I'm having a little trouble accessing my deeper thinking right now, but I'm still here to help however I can! 💖`;
  }
}

// Enhanced response generation with AAPCAppE cultural intelligence
async function generateResponse(message, contextualInfo, locationRelevant, locationUsed) {
  const messageLower = message.toLowerCase();

  // Enhanced math detection
  const mathPattern = /(\d+)\s*([+\-*/])\s*(\d+)/;
  const mathMatch = message.match(mathPattern);

  if (mathMatch) {
    const num1 = parseInt(mathMatch[1]);
    const operator = mathMatch[2].trim();
    const num2 = parseInt(mathMatch[3]);

    let result;
    switch(operator) {
      case '+': result = num1 + num2; break;
      case '-': result = num1 - num2; break;
      case '*': result = num1 * num2; break;
      case '/':
        if (num2 === 0) {
          return "Well hello there, sweetie! I can't divide by zero - that would break the universe! Try a different number. Math works the same everywhere, including that rule! 😊";
        }
        result = num1 / num2;
        result = result % 1 === 0 ? result : result.toFixed(2);
        break;
      default:
        result = "something interesting";
    }

    return `Well hello there, sweetie! That's ${result}. Math works the same everywhere! 😊`;
  }

  // Word-based math
  if (messageLower.includes('calculate') || messageLower.includes('plus') || messageLower.includes('minus')) {
    if (messageLower.includes('two plus two') || messageLower.includes('2 plus 2')) {
      return "Well hello there, sweetie! That's 4. Math works the same everywhere! 😊";
    }
  }

  // Complex responses requiring LLM with AAPCAppE enhancement
  const complexQueries = [
    'tell me about yourself', 'about yourself',
    'how are you', 'how are you doing', 'how are you today',
    'explain quantum physics', 'explain chemistry', 'explain biology',
    'tell me about', 'what do you think', 'your opinion'
  ];

  const needsLLM = complexQueries.some(keyword => messageLower.includes(keyword));

  if (needsLLM && !messageLower.includes('photosynthesis') && !messageLower.includes('gravity')) {
    return await generateLLMResponse(message, contextualInfo.includes('User is at') ?
      { latitude: contextualInfo.match(/User is at ([\d\.\-]+), ([\d\.\-]+)/)?.[1],
        longitude: contextualInfo.match(/User is at ([\d\.\-]+), ([\d\.\-]+)/)?.[2] } : null);
  }

  // Science questions
  if (messageLower.includes('photosynthesis')) {
    return "Well hello there, sweetie! Photosynthesis is the process where plants use sunlight, water, and carbon dioxide to make their own food (glucose) and release oxygen. It happens in the leaves using chlorophyll - that's what makes them green! Pretty amazing how plants make their own food from sunlight, isn't it? 🌱";
  }

  if (messageLower.includes('gravity')) {
    return "Well hello there, sweetie! Gravity is the force that pulls things toward each other. Here in the mountains of West Virginia, it's what keeps us grounded and makes water flow down our beautiful valleys! It's why when you drop something, it falls down instead of floating away. 🏔️";
  }

  // Identity questions
  if (messageLower.includes('your name') || messageLower.includes('who are you')) {
    return "Well hello there, honey child! I'm Ms. Jarvis, your AI assistant from the beautiful mountains of West Virginia. I'm here to help you with whatever's on your mind! 💖";
  }

  // Location-relevant responses
  if (locationRelevant) {
    if (locationUsed && contextualInfo.includes('User is at')) {
      return `Well hey there, sweetie! I can see exactly where you are. For "${message}", let me help you find what's closest to your current location!`;
    } else if (locationRelevant) {
      return `Well hey there, sweetie! For "${message}", I'll help you find options around the Mount Hope area since I don't have your exact location.`;
    }
  }

  // Conversational responses
  if (messageLower.includes('hello') || messageLower.includes('hi ') || messageLower === 'hi') {
    return "Well hello there, sweetie! How are you doing today? I'm here if you need anything! 😊";
  }

  if (messageLower.includes('thank')) {
    return "Well, you're so welcome, honey child! Happy to help anytime! 💖";
  }

  // Fallback to LLM with AAPCAppE enhancement for unhandled queries
  return await generateLLMResponse(message, contextualInfo.includes('User is at') ?
    { latitude: contextualInfo.match(/User is at ([\d\.\-]+), ([\d\.\-]+)/)?.[1],
      longitude: contextualInfo.match(/User is at ([\d\.\-]+), ([\d\.\-]+)/)?.[2] } : null);
}

// Health endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Ms. Jarvis Core API with AAPCAppE Integration - Mount Hope, WV',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      chat: '/api/chat-with-mountainshares-brain'
    },
    location: 'Mount Hope, West Virginia',
    version: '1.0.0-aapcappe-balanced',
    culturalIntegration: {
      aapcappeProcessor: aapcappeProcessor ? 'active' : 'inactive',
      appalachianIntelligence: appalachianIntelligence ? 'active' : 'inactive',
      personalityBalance: 'adaptive'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Ms. Jarvis with balanced AAPCAppE authentic dialect integration is healthy and serving Mount Hope, WV! 🏔️',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Ms. Jarvis API - Mount Hope, WV',
    version: '1.0.0-aapcappe-balanced'
  });
});

// Enhanced chat endpoint with AAPCAppE cultural intelligence
app.post('/chat-with-mountainshares-brain', async (req, res) => {
  try {
    const { message, userId, messageId, locationContext } = req.body;

    const locationRelevant = isLocationRelevantQuery(message);

    let contextualInfo = "";
    let locationUsed = false;

    if (locationRelevant && locationContext && locationContext.latitude) {
      contextualInfo = `User is at ${locationContext.latitude}, ${locationContext.longitude}. `;
      locationUsed = true;
    } else if (locationRelevant) {
      contextualInfo = "User location unavailable, using Mount Hope, WV as default. ";
    }

    const reply = await generateResponse(message, contextualInfo, locationRelevant, locationUsed);

    res.status(200).json({
      reply: reply,
      timestamp: new Date().toISOString(),
      userId: userId,
      messageId: messageId,
      locationUsed: locationUsed,
      locationRelevant: locationRelevant,
      culturalEnhancement: 'aapcappe-integrated-balanced'
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Sorry, honey child, I\'m having a bit of trouble right now. Please try again in a moment!',
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Ms. Jarvis API Server with Balanced AAPCAppE Integration - Mount Hope, WV',
    endpoints: {
      health: '/health',
      'api-health': '/api/health',
      chat: '/chat-with-mountainshares-brain'
    },
    culturalIntegration: 'aapcappe-enhanced-balanced'
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Initialize cultural intelligence and start server
async function startServer() {
  await initializeCulturalIntelligence();
  
  app.listen(PORT, () => {
    console.log(`🏔️ Ms. Jarvis Core API Server with Balanced AAPCAppE Integration running on port ${PORT}`);
    console.log(`Serving Mount Hope, WV with authentic but balanced Appalachian AI`);
    console.log(`Cultural Integration Status: ${aapcappeProcessor ? 'AAPCAppE Active - Balanced Mode' : 'Basic Mode'}`);
  });
}

startServer();

module.exports = app;
