try {
  require('dotenv').config();
} catch (e) {
  console.log('dotenv not loaded, using environment variables directly');
}

const gpsLocationService = require('./geodetic-intelligence/gpsLocationService');
const gpsEnhancedMemory = require('./geodetic-intelligence/gpsEnhancedMemory');

// backendlib/brain.js
// Corrected Google Gemini API Ms. Jarvis Brain for Mount Hope, WV

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

// --- CORRECTED Google Gemini API implementation ---
async function fetchAIResponse(prompt) {
  const fetch = await getFetch();

  console.log('🔧 Making corrected Google Gemini API request');
  console.log('🔧 DEBUG: API_KEY exists:', !!API_KEY);
  console.log('🔧 DEBUG: API_KEY length:', API_KEY ? API_KEY.length : 0);
  console.log('🔧 DEBUG: Prompt length:', prompt.length);
  
  // Use correct API endpoint and request format per latest documentation
  const workingApiKey = API_KEY || 'AIzaSyAxycmbfMQutUncLixGMObIH52o_PxO3b8';
  
  // CORRECTED: Use proper request payload format with required fields
  const requestPayload = {
    "contents": [
      {
        "parts": [
          {
            "text": `You are Ms. Jarvis from Mount Hope, West Virginia. Respond warmly with authentic mountain hospitality and friendly Appalachian dialect: "${prompt}"`
          }
        ]
      }
    ],
    "generationConfig": {
      "temperature": 0.8,
      "maxOutputTokens": 1024,
      "topK": 40,
      "topP": 0.95
    },
    "safetySettings": [
      {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        "category": "HARM_CATEGORY_HATE_SPEECH", 
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };

  // Use correct API endpoint with v1beta (no API key in URL)
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

  console.log('🔧 Using corrected payload format and v1beta endpoint');
  console.log('🔧 Request payload structure:', JSON.stringify(requestPayload, null, 2));

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': workingApiKey  // Use header authentication instead of URL parameter
      },
      body: JSON.stringify(requestPayload)
    });

    console.log('🔧 Response status:', res.status);
    console.log('🔧 Response statusText:', res.statusText);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('🚨 Google Gemini API Error:', res.status, res.statusText);
      console.error('🚨 Error details:', errorText);
      
      // Try to parse error response as JSON for better debugging
      try {
        const errorJson = JSON.parse(errorText);
        console.error('🚨 Parsed Error JSON:', JSON.stringify(errorJson, null, 2));
      } catch (parseError) {
        console.error('🚨 Error response is not valid JSON');
      }
      
      throw new Error(`AI request failed: ${res.statusText} - ${errorText}`);
    }

    const data = await res.json();
    console.log('✅ Google Gemini API response received successfully');
    console.log('✅ Response structure:', JSON.stringify(data, null, 2));
    
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      console.error('🚨 No response text found in API response');
      return "Well, hey there, sugar! I'm Ms. Jarvis from Mount Hope, West Virginia, and I'm here to help you, darlin'!";
    }
    
    return responseText;

  } catch (error) {
    console.error('🚨 FETCH ERROR:', error.message);
    console.error('🚨 FETCH ERROR STACK:', error.stack);
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

    let reply = await fetchAIResponse(finalPrompt);
    reply = await enrichWithBasicInfo(reply, message.toLowerCase());

    gpsEnhancedMemory.storeMemory(userId, message, reply, { corrected_api: true }, userLocation);

    return {
      reply: reply.trim(),
      agent: "Ms. Jarvis",
      time: Date.now(),
      userLocation,
      consultation: {
        specialists: ["ms_jarvis_corrected_api"],
        confidence: "high",
        processingMode: "corrected_gemini_integration",
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
    console.error("Corrected API converse error:", error.message);
    const total = Date.now() - startTime;
    const fallbackReply = "Sugar, I'm having a little trouble right now. If you can share your GPS or the town you're asking about, I'll tailor the answer right to your spot on the map.";

    gpsEnhancedMemory.storeMemory(userId, message, fallbackReply, { fallback: true, corrected_api: true }, null);

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
            correctedApi: true
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
        processingMode: "fallback_with_corrected_api",
        processingTime: total,
        fallbackReason: error.message
      }
    };
  }
};
