try {
  require('dotenv').config();
} catch (e) {
  console.log('dotenv not loaded, using environment variables directly');
}

const gpsLocationService = require('./geodetic-intelligence/gpsLocationService');
const gpsEnhancedMemory = require('./geodetic-intelligence/gpsEnhancedMemory');

// backendlib/brain.js
// Simplified Ms. Jarvis Brain for Mount Hope, WV

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
const API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyAxycmbfMQutUncLixGMObIH52o_PxO3b8';
const COMM_SERVER_URL = process.env.COMMUNICATIONS_SERVER_URL || 'http://your-communications-server-url';

// --- SIMPLIFIED AI model calling function ---
async function fetchAIResponse(prompt) {
  const fetch = await getFetch();

  console.log('🔧 Making simplified Google Gemini API request');
  console.log('🔧 Using prompt:', prompt.substring(0, 100) + '...');
  
  // SIMPLIFIED: Use minimal payload that matches your working direct tests
  const requestPayload = {
    contents: [
      {
        parts: [
          {
            text: `You are Ms. Jarvis from Mount Hope, West Virginia. Respond to this message with authentic mountain hospitality and friendly Appalachian dialect: "${prompt}"`
          }
        ]
      }
    ]
  };

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  console.log('🔧 API URL (key hidden):', apiUrl.replace(API_KEY, 'API_KEY_HIDDEN'));

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestPayload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('🚨 Google Gemini API Error:', res.status, res.statusText);
    console.error('🚨 Error details:', errorText);
    throw new Error(`AI request failed: ${res.statusText}`);
  }

  const data = await res.json();
  console.log('✅ Google Gemini API response received');
  
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Well, hey there, sugar! I'm Ms. Jarvis from Mount Hope, West Virginia, and I'm here to help you, darlin'!";
}

// --- SIMPLIFIED prompt building ---
function buildFinalPrompt(message, userLocation, judgeSynth) {
  // Return the user message directly for simple processing
  return message;
}

// --- Utility: Enrich reply with basic info ---
async function enrichWithBasicInfo(reply, msgLower) {
  // Add basic Mount Hope information if relevant
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
    // Simplified user location determination
    const userLocation = { 
      locationType: 'default', 
      locationSource: 'Mount Hope, WV default',
      confidence: 'medium'
    };

    // Get relevant memories (simplified)
    const relevantMemories = await gpsEnhancedMemory.retrieveLocationRelevantMemories(userId, message, null, 3);
    
    // Simple document context
    const relevantDocs = docsearch.searchDocuments(message, msDocs, 2);
    const docContext = relevantDocs.map(doc => doc.paragraph.slice(0, 100)).join(' ');

    // Build simple prompt
    const finalPrompt = buildFinalPrompt(message, userLocation, docContext);

    // Get AI response with simplified implementation
    let reply = await fetchAIResponse(finalPrompt);

    // Add basic enrichment
    reply = await enrichWithBasicInfo(reply, message.toLowerCase());

    // Store memory (simplified)
    gpsEnhancedMemory.storeMemory(userId, message, reply, { simplified: true }, userLocation);

    return {
      reply: reply.trim(),
      agent: "Ms. Jarvis",
      time: Date.now(),
      userLocation,
      consultation: {
        specialists: ["ms_jarvis_simplified"],
        confidence: "high",
        processingMode: "simplified_ai_integration",
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
    console.error("Simplified converse error:", error.message);
    const total = Date.now() - startTime;
    const fallbackReply = "Sugar, I'm having a little trouble right now. If you can share your GPS or the town you're asking about, I'll tailor the answer right to your spot on the map.";
    
    // Store fallback memory
    gpsEnhancedMemory.storeMemory(userId, message, fallbackReply, { fallback: true }, null);
    
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
            error: error.message
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
        processingMode: "fallback", 
        processingTime: total, 
        fallbackReason: error.message 
      } 
    };
  }
};
