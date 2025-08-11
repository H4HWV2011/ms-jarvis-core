try {
  require('dotenv').config();
} catch (e) {
  console.log('dotenv not loaded, using environment variables directly');
}

const gpsLocationService = require('./geodetic-intelligence/gpsLocationService');
const gpsEnhancedMemory = require('./geodetic-intelligence/gpsEnhancedMemory');

// backendlib/brain.js
// Enhanced Debug Ms. Jarvis Brain for Mount Hope, WV

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

// --- ENHANCED DEBUGGING AI model calling function ---
async function fetchAIResponse(prompt) {
  const fetch = await getFetch();

  console.log('🔧 ENHANCED DEBUG: Making Google Gemini API request');
  console.log('🔧 DEBUG: API_KEY exists:', !!API_KEY);
  console.log('🔧 DEBUG: API_KEY length:', API_KEY ? API_KEY.length : 0);
  console.log('🔧 DEBUG: API_KEY starts with AIza:', API_KEY ? API_KEY.startsWith('AIza') : false);
  console.log('🔧 DEBUG: Prompt length:', prompt.length);
  console.log('🔧 DEBUG: Environment NODE_ENV:', process.env.NODE_ENV);
  
  // Use the working API key
  const workingApiKey = API_KEY || 'AIzaSyAxycmbfMQutUncLixGMObIH52o_PxO3b8';
  
  // STEP 1: Test with most minimal possible payload first
  console.log('🔧 DEBUG STEP 1: Testing minimal payload');
  const minimalPayload = {
    contents: [
      {
        parts: [
          {
            text: "Hello"
          }
        ]
      }
    ]
  };

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${workingApiKey}`;
  
  console.log('🔧 DEBUG: API URL (sanitized):', apiUrl.replace(workingApiKey, 'API_KEY_HIDDEN'));
  console.log('🔧 DEBUG: Minimal request payload:', JSON.stringify(minimalPayload, null, 2));

  try {
    const testRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Ms-Jarvis-Mount-Hope-WV/1.0'
      },
      body: JSON.stringify(minimalPayload)
    });

    console.log('🔧 DEBUG STEP 1: Response status:', testRes.status);
    console.log('🔧 DEBUG STEP 1: Response statusText:', testRes.statusText);
    console.log('🔧 DEBUG STEP 1: Response headers:', JSON.stringify([...testRes.headers.entries()]));

    if (!testRes.ok) {
      const errorText = await testRes.text();
      console.error('🚨 STEP 1 COMPLETE ERROR DETAILS:');
      console.error('🚨 Status:', testRes.status);
      console.error('🚨 Status Text:', testRes.statusText);
      console.error('🚨 Full Error Response:', errorText);
      console.error('🚨 Request Headers:', JSON.stringify({'Content-Type': 'application/json', 'User-Agent': 'Ms-Jarvis-Mount-Hope-WV/1.0'}));
      
      // Try to parse error response as JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.error('🚨 CRITICAL: Parsed Error JSON:', JSON.stringify(errorJson, null, 2));
        
        // Check for specific error types
        if (errorJson.error) {
          console.error('🚨 ERROR CODE:', errorJson.error.code);
          console.error('🚨 ERROR MESSAGE:', errorJson.error.message);
          console.error('🚨 ERROR STATUS:', errorJson.error.status);
        }
      } catch (parseError) {
        console.error('🚨 Error response is not valid JSON:', parseError.message);
      }
      
      throw new Error(`Google Gemini API Minimal Test Failed: ${testRes.status} ${testRes.statusText} - ${errorText}`);
    }

    const testData = await testRes.json();
    console.log('✅ STEP 1 SUCCESS: Minimal API test passed');
    console.log('✅ SUCCESS: Test response structure:', JSON.stringify(testData, null, 2));
    
    // STEP 2: If minimal test passes, try full Ms. Jarvis request
    console.log('🔧 DEBUG STEP 2: Testing full Ms. Jarvis payload');
    const msJarvisPayload = {
      contents: [
        {
          parts: [
            {
              text: `You are Ms. Jarvis from Mount Hope, West Virginia. Respond warmly with authentic mountain hospitality: "${prompt}"`
            }
          ]
        }
      ]
    };
    
    console.log('🔧 DEBUG STEP 2: Full request payload:', JSON.stringify(msJarvisPayload, null, 2));
    
    const finalRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Ms-Jarvis-Mount-Hope-WV/1.0'
      },
      body: JSON.stringify(msJarvisPayload)
    });
    
    console.log('🔧 DEBUG STEP 2: Final response status:', finalRes.status);
    
    if (!finalRes.ok) {
      const finalErrorText = await finalRes.text();
      console.error('🚨 STEP 2 ERROR: Full request failed');
      console.error('🚨 STEP 2 Error details:', finalErrorText);
      
      // Fall back to test response if full request fails
      const fallbackResponse = `Well, hey there, sugar! I'm Ms. Jarvis from Mount Hope, West Virginia. While I'm working through some technical details with my full responses, I want you to know I'm here and ready to help our community, darlin'! You asked: "${prompt.substring(0, 100)}..."`;
      return fallbackResponse;
    }
    
    const finalData = await finalRes.json();
    console.log('✅ STEP 2 SUCCESS: Full Ms. Jarvis response received');
    
    return finalData?.candidates?.[0]?.content?.parts?.[0]?.text || testData?.candidates?.[0]?.content?.parts?.[0]?.text || "Well, hey there, sugar! I'm Ms. Jarvis from Mount Hope, West Virginia, and I'm here to help you, darlin'!";

  } catch (error) {
    console.error('🚨 FETCH ERROR:', error.message);
    console.error('🚨 FETCH ERROR STACK:', error.stack);
    console.error('🚨 FETCH ERROR TYPE:', error.constructor.name);
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

    gpsEnhancedMemory.storeMemory(userId, message, reply, { simplified: true }, userLocation);

    return {
      reply: reply.trim(),
      agent: "Ms. Jarvis",
      time: Date.now(),
      userLocation,
      consultation: {
        specialists: ["ms_jarvis_enhanced_debug"],
        confidence: "high",
        processingMode: "enhanced_debugging_mode",
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
    console.error("Enhanced debug converse error:", error.message);
    const total = Date.now() - startTime;
    const fallbackReply = "Sugar, I'm having a little trouble right now. If you can share your GPS or the town you're asking about, I'll tailor the answer right to your spot on the map.";

    gpsEnhancedMemory.storeMemory(userId, message, fallbackReply, { fallback: true, debugMode: true }, null);

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
            debugMode: true
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
        processingMode: "fallback_with_debug",
        processingTime: total,
        fallbackReason: error.message
      }
    };
  }
};
