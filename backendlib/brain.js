try {
  require('dotenv').config();
} catch (e) {
  console.log('dotenv not loaded, using environment variables directly');
}

const gpsLocationService = require('./geodetic-intelligence/gpsLocationService');
const gpsEnhancedMemory = require('./geodetic-intelligence/gpsEnhancedMemory');

// backendlib/brain.js
// GPU OPTIMIZED OLLAMA LOCAL API Ms. Jarvis Brain for Mount Hope, WV

const { ContinuousLearningEngine } = require('./continuous-learning');
const learningEngine = new ContinuousLearningEngine();

const fs = require('fs');
// FIXED: ES Module dynamic import for node-fetch
const getFetch = async () => {
  const module = await import('node-fetch');
  return module.default;
};

const docsearch = require('./docsearch');
const crypto = require('crypto');

const msDocs = docsearch.loadDocuments();
const COMM_SERVER_URL = process.env.COMMUNICATIONS_SERVER_URL || 'http://your-communications-server-url';

// --- GPU OPTIMIZED OLLAMA LOCAL API implementation ---
async function fetchAIResponse(prompt) {
  const fetch = await getFetch();

  console.log('🔧 Making Ollama LOCAL API request with GPU optimized phi3:mini model');
  console.log('🔧 Optimized for 1.265GB VRAM usage vs 5.4GB llama3:latest');
  
  const requestPayload = {
    "model": "phi3:mini",  // Changed from llama3:latest to resolve GPU VRAM issues
    "prompt": `You are Ms. Jarvis from Mount Hope, West Virginia. Respond warmly with authentic mountain hospitality and friendly Appalachian dialect: "${prompt}"`,
    "stream": false,
    "options": {
      "temperature": 0.8,
      "num_predict": 1024,
      "stop": ["\n\n"]
    }
  };

  // Use confirmed working local Ollama API endpoint
  const apiUrl = `http://localhost:11434/api/generate`;

  console.log('🔧 Using GPU OPTIMIZED phi3:mini model - VRAM timeout issues resolved');
  console.log('🔧 Request payload:', JSON.stringify(requestPayload, null, 2));

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload),
      timeout: 30000
    });

    console.log('🔧 Ollama response status:', res.status);
    console.log('🔧 Ollama response statusText:', res.statusText);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('🚨 Ollama API Error:', res.status, res.statusText);
      console.error('🚨 Error details:', errorText);
      throw new Error(`Ollama request failed: ${res.statusText}`);
    }

    const data = await res.json();
    console.log('✅ Ollama phi3:mini API response received successfully');
    console.log('✅ Response structure:', JSON.stringify(data, null, 2));
    
    // Extract response from Ollama API format
    const responseText = data.response;
    
    if (!responseText) {
      console.error('🚨 No response text found in Ollama response');
      console.error('🚨 Full response data:', JSON.stringify(data, null, 2));
      return "Well, hey there, sugar! I'm Ms. Jarvis from Mount Hope, West Virginia, and I'm here to help you, darlin'!";
    }
    
    console.log('✅ Successfully extracted phi3:mini response text:', responseText.substring(0, 100) + '...');
    return responseText;

  } catch (error) {
    console.error('🚨 Ollama phi3:mini FETCH ERROR:', error.message);
    console.error('🚨 Ollama phi3:mini FETCH ERROR STACK:', error.stack);
    throw error;
  }
}

// --- SIMPLIFIED prompt building ---
function buildFinalPrompt(message, userLocation, judgeSynth) {
  return message;
}

// --- Utility: Enrich reply with basic info ---
async function enrichWithBasicInfo(reply, msgLower) {
  if (msgLower.includes('mount hope') || msgLower.includes('mounthope')) {
    reply += "\n\nMount Hope is a beautiful community here in West Virginia, and I'm proud to call it home!";
  }
  return reply;
}

// --- Main entrypoint ---
exports.converse = async function(message, userId, requestMetadata = {}) {
  const startTime = Date.now();
  if (!message?.trim()) {
    return {
      reply: "I'm here to help, darlin'. What can I do for you?",
      agent: "Ms. Jarvis",
      time: Date.now(),
      consultation: {
        specialists: [],
        confidence: "high",
        processingMode: "input_validation",
        processingTime: Date.now() - startTime
      }
    };
  }

  try {
    const userLocation = {
      locationType: 'default',
      locationSource: 'Mount Hope, WV default',
      confidence: 'medium'
    };

    const relevantMemories = await gpsEnhancedMemory.retrieveLocationRelevantMemories(userId, message, null, 3);
    const relevantDocs = docsearch.searchDocuments(message, msDocs, 2);
    const docContext = relevantDocs.map(doc => doc.paragraph.slice(0, 100)).join(' ');
    const finalPrompt = buildFinalPrompt(message, userLocation, docContext);

    console.log('🔧 Processing message with GPU OPTIMIZED phi3:mini:', message.substring(0, 50) + '...');
    console.log('🔧 Final prompt for phi3:mini:', finalPrompt.substring(0, 50) + '...');

    let reply = await fetchAIResponse(finalPrompt);
    reply = await enrichWithBasicInfo(reply, message.toLowerCase());

    gpsEnhancedMemory.storeMemory(userId, message, reply, { gpu_optimized_phi3_mini: true }, userLocation);

    console.log('✅ Successfully processed request with GPU optimized phi3:mini LOCAL API');

    return {
      reply: reply.trim(),
      agent: "Ms. Jarvis",
      time: Date.now(),
      userLocation,
      consultation: {
        specialists: ["ms_jarvis_gpu_optimized_phi3_mini"],
        confidence: "high",
        processingMode: "gpu_optimized_phi3_mini_integration",
        processingTime: Date.now() - startTime,
        gpsLocationData: {
          coordinatesUsed: null,
          locationType: userLocation?.locationType || null,
          locationSource: userLocation?.locationSource || null,
          confidence: userLocation?.confidence || null,
          withinWV: true
        }
      }
    };

  } catch (error) {
    console.error("GPU optimized phi3:mini converse error:", error.message);
    console.error("GPU optimized phi3:mini converse error stack:", error.stack);
    const total = Date.now() - startTime;
    const fallbackReply = "Sugar, I'm having a little trouble right now. If you can share your GPS or the town you're asking about, I'll tailor the answer right to your spot on the map.";

    gpsEnhancedMemory.storeMemory(userId, message, fallbackReply, { fallback: true, gpu_optimized_phi3_mini: true }, null);

    try {
      const fetch = await getFetch();
      fetch(`${COMM_SERVER_URL}/api/store-communication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: message,
          aiResponse: fallbackReply,
          userId,
          metadata: {
            processingTime: total,
            specialists: ['authentic_fallback'],
            confidence: 'medium',
            isFallback: true,
            error: error.message,
            gpuOptimizedPhi3Mini: true
          }
        })
      }).catch(() => {});
    } catch {}

    return {
      reply: fallbackReply,
      agent: "Ms. Jarvis",
      time: Date.now(),
      consultation: {
        specialists: ["authentic_fallback"],
        confidence: "medium",
        processingMode: "fallback_with_gpu_optimized_phi3_mini",
        processingTime: total,
        fallbackReason: error.message
      }
    };
  }
};
