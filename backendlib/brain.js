try {
  require('dotenv').config();
} catch (e) {
  console.log('dotenv not loaded, using environment variables directly');
}

const gpsLocationService = require('./geodetic-intelligence/gpsLocationService');
const gpsEnhancedMemory = require('./geodetic-intelligence/gpsEnhancedMemory');

// backendlib/brain.js
// FINAL CORRECTED Google Gemini API Ms. Jarvis Brain for Mount Hope, WV

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

// --- FINAL CORRECTED Google Gemini API implementation per latest documentation ---
async function fetchAIResponse(prompt) {
  const fetch = await getFetch();

  console.log('🔧 Making FINAL CORRECTED Google Gemini API request');
  
  // Use environment variable API key
  const workingApiKey = process.env.GOOGLE_API_KEY || 'AIzaSyAxycmbfMQutUncLixGMObIH52o_PxO3b8';
  
  if (!workingApiKey) {
    throw new Error('GOOGLE_API_KEY not found in environment variables');
  }
  
  console.log('🔧 DEBUG: API_KEY exists:', !!workingApiKey);
  console.log('🔧 DEBUG: API_KEY length:', workingApiKey ? workingApiKey.length : 0);
  console.log('🔧 DEBUG: API_KEY starts with AIza:', workingApiKey ? workingApiKey.startsWith('AIza') : false);
  console.log('🔧 DEBUG: Prompt length:', prompt.length);
  
  // FINAL CORRECTED: Use proper request payload format per latest docs
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
      "topP": 0.9,
      "topK": 40,
      "stopSequences": [],
      "candidateCount": 1
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

  // FINAL CORRECTED: Use proper endpoint without API key in URL
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

  console.log('🔧 Using FINAL CORRECTED request format and header authentication');
  console.log('🔧 API URL:', apiUrl);
  console.log('🔧 Request payload structure:', JSON.stringify(requestPayload, null, 2));

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': workingApiKey  // FINAL CORRECTED: Use header authentication
      },
      body: JSON.stringify(requestPayload)
    });

    console.log('🔧 Response status:', res.status);
    console.log('🔧 Response statusText:', res.statusText);
    console.log('🔧 Response headers:', JSON.stringify([...res.headers.entries()]));

    if (!res.ok) {
      const errorText = await res.text();
      console.error('🚨 Google Gemini API Error (FINAL CORRECTED):', res.status, res.statusText);
      console.error('🚨 Full error response:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('🚨 Parsed Error JSON:', JSON.stringify(errorJson, null, 2));
        
        if (errorJson.error) {
          console.error('🚨 ERROR CODE:', errorJson.error.code);
          console.error('🚨 ERROR MESSAGE:', errorJson.error.message);
          console.error('🚨 ERROR STATUS:', errorJson.error.status);
          console.error('🚨 ERROR DETAILS:', JSON.stringify(errorJson.error.details, null, 2));
        }
      } catch (parseError) {
        console.error('🚨 Error response is not valid JSON:', parseError.message);
      }
      
      throw new Error(`AI request failed: ${res.statusText} - ${errorText}`);
    }

    const data = await res.json();
    console.log('✅ FINAL CORRECTED Google Gemini API response received successfully');
    console.log('✅ Response structure:', JSON.stringify(data, null, 2));
    
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      console.error('🚨 No response text found in API response');
      console.error('🚨 Full response data:', JSON.stringify(data, null, 2));
      return "Well, hey there, sugar! I'm Ms. Jarvis from Mount Hope, West Virginia, and I'm here to help you, darlin'!";
    }
    
    console.log('✅ Successfully extracted response text:', responseText.substring(0, 100) + '...');
    return responseText;

  } catch (error) {
    console.error('🚨 FINAL CORRECTED FETCH ERROR:', error.message);
    console.error('🚨 FINAL CORRECTED FETCH ERROR STACK:', error.stack);
    console.error('🚨 FINAL CORRECTED FETCH ERROR TYPE:', error.constructor.name);
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

    console.log('🔧 Processing message:', message.substring(0, 50) + '...');
    console.log('🔧 Final prompt:', finalPrompt.substring(0, 50) + '...');

    let reply = await fetchAIResponse(finalPrompt);
    reply = await enrichWithBasicInfo(reply, message.toLowerCase());

    gpsEnhancedMemory.storeMemory(userId, message, reply, { final_corrected_api: true }, userLocation);

    console.log('✅ Successfully processed request with final corrected API');

    return {
      reply: reply.trim(),
      agent: "Ms. Jarvis",
      time: Date.now(),
      userLocation,
      consultation: {
        specialists: ["ms_jarvis_final_corrected_api"],
        confidence: "high",
        processingMode: "final_corrected_gemini_integration",
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
    console.error("Final corrected API converse error:", error.message);
    console.error("Final corrected API converse error stack:", error.stack);
    const total = Date.now() - startTime;
    const fallbackReply = "Sugar, I'm having a little trouble right now. If you can share your GPS or the town you're asking about, I'll tailor the answer right to your spot on the map.";

    gpsEnhancedMemory.storeMemory(userId, message, fallbackReply, { fallback: true, final_corrected_api: true }, null);

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
            finalCorrectedApi: true
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
        processingMode: "fallback_with_final_corrected_api",
        processingTime: total,
        fallbackReason: error.message
      }
    };
  }
};
