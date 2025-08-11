try {
  require('dotenv').config();
} catch (e) {
  console.log('dotenv not loaded, using environment variables directly');
}

const gpsLocationService = require('./geodetic-intelligence/gpsLocationService');
const gpsEnhancedMemory = require('./geodetic-intelligence/gpsEnhancedMemory');

// backendlib/brain.js
// ENHANCED GEODETIC GPS INTELLIGENCE Ms. Jarvis Brain for Mount Hope, WV

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

// Mount Hope coordinates for geodetic calculations
const MOUNT_HOPE_COORDINATES = {
  latitude: 37.9042,
  longitude: -81.1628,
  elevation: 2100 // feet above sea level in Appalachian Mountains
};

// --- GROQ API with Enhanced Geodetic Intelligence ---
async function fetchAIResponse(prompt) {
  const fetch = await getFetch();

  console.log('🔧 Making GROQ API request with geodetic-enhanced intelligence');
  
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not found in environment variables');
  }
  
  console.log('🔧 Using GROQ API with enhanced spatial awareness');
  
  const requestPayload = {
    "model": "llama3-8b-8192",
    "messages": [
      {
        "role": "system",
        "content": "You are Ms. Jarvis from Mount Hope, West Virginia. You speak with authentic mountain hospitality and friendly Appalachian dialect. You're proud of your community and always warm and welcoming. Use phrases like 'sugar', 'darlin'', 'honey child' naturally. You have deep knowledge of West Virginia culture, history, and geography."
      },
      {
        "role": "user", 
        "content": prompt
      }
    ],
    "temperature": 0.8,
    "max_tokens": 1024
  };

  const apiUrl = `https://api.groq.com/openai/v1/chat/completions`;

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(requestPayload)
    });

    console.log('🔧 GROQ response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('🚨 GROQ API Error:', res.status, res.statusText);
      throw new Error(`GROQ API request failed: ${res.statusText} - ${errorText}`);
    }

    const data = await res.json();
    console.log('✅ GROQ API response received successfully');
    
    const responseText = data.choices[0].message.content;
    
    if (!responseText) {
      console.error('🚨 No response text found in GROQ response');
      return "Well, hey there, sugar! I'm Ms. Jarvis from Mount Hope, West Virginia, and I'm here to help you, darlin'!";
    }
    
    console.log('✅ Successfully extracted GROQ response text');
    return responseText;

  } catch (error) {
    console.error('🚨 GROQ API FETCH ERROR:', error.message);
    throw error;
  }
}

// --- Enhanced Geodetic Location Processing ---
async function enrichUserLocationWithGeodetic(rawLocationData) {
  try {
    // Use geodetic layer to validate and enhance location data
    const geodeticEnhancement = await gpsLocationService.enhanceWithGeodeticData(rawLocationData);
    
    return {
      coordinates: geodeticEnhancement.coordinates,
      address: geodeticEnhancement.address,
      locality: geodeticEnhancement.locality || 'Mount Hope',
      region: geodeticEnhancement.region || 'WV',
      elevation: geodeticEnhancement.elevation,
      terrainFeatures: geodeticEnhancement.terrainFeatures || [],
      nearbyLandmarks: geodeticEnhancement.nearbyLandmarks || [],
      distanceFromMountHope: geodeticEnhancement.distanceFromMountHope || 0,
      withinMountHopeArea: geodeticEnhancement.distanceFromMountHope < 10000, // 10km radius
      confidence: 'high',
      locationType: 'geodetic_enhanced',
      locationSource: geodeticEnhancement.address || 'Mount Hope, WV geodetic',
      geodeticMetadata: {
        datum: geodeticEnhancement.datum || 'WGS84',
        precision: geodeticEnhancement.precision || 'sub-meter',
        surveyDate: geodeticEnhancement.surveyDate,
        controlPoints: geodeticEnhancement.nearbyControlPoints || []
      }
    };
  } catch (error) {
    console.log('🔧 Fallback to default Mount Hope location due to geodetic error:', error.message);
    return {
      locationType: 'default',
      locationSource: 'Mount Hope, WV default',
      confidence: 'medium',
      coordinates: MOUNT_HOPE_COORDINATES
    };
  }
}

// --- Background GPS Intelligence: Location Query Detection ---
function isLocationRelevantQuery(message) {
  const locationKeywords = ['where', 'location', 'area', 'town', 'city', 'local', 
                           'here', 'around here', 'nearby', 'directions', 'address',
                           'places', 'map', 'distance', 'how far', 'close to'];
  return locationKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

// --- Cultural Context Detection ---
function needsCulturalContext(message, userLocation) {
  const culturalKeywords = ['history', 'tradition', 'culture', 'heritage', 'family', 
                           'community', 'local', 'mountain', 'coal', 'mining',
                           'appalachian', 'west virginia', 'mount hope'];
  
  const hasCulturalQuery = culturalKeywords.some(keyword => message.toLowerCase().includes(keyword));
  const isLocalUser = userLocation?.withinMountHopeArea || userLocation?.locality === 'Mount Hope';
  
  return hasCulturalQuery && isLocalUser;
}

// --- Enhanced Context Filtering Using Geodetic Intelligence ---
function filterContextByGeodeticProximity(docContext, userLocation) {
  if (!userLocation?.coordinates || !docContext) return docContext;
  
  // Use geodetic layer to prioritize content based on spatial relationships
  if (userLocation.withinMountHopeArea) {
    // Prioritize local Mount Hope content
    const localKeywords = ['mount hope', 'west virginia', 'coal', 'mining', 'appalachian', 'mountain'];
    
    if (localKeywords.some(keyword => docContext.toLowerCase().includes(keyword))) {
      return docContext + ` [Local relevance: ${userLocation.distanceFromMountHope}m from Mount Hope center]`;
    }
  }
  
  return docContext;
}

// --- Background GPS-Aware Prompt Building ---
function buildFinalPrompt(message, userLocation, docContext) {
  // Enhanced geodetic context filtering
  const geodeticEnhancedContext = filterContextByGeodeticProximity(docContext, userLocation);
  
  // Only add location context when conversation naturally calls for it
  if (isLocationRelevantQuery(message)) {
    let locationContext = '';
    
    if (userLocation?.nearbyLandmarks && userLocation.nearbyLandmarks.length > 0) {
      locationContext += `Nearby landmarks: ${userLocation.nearbyLandmarks.join(', ')}. `;
    }
    
    if (userLocation?.terrainFeatures && userLocation.terrainFeatures.length > 0) {
      locationContext += `Terrain: ${userLocation.terrainFeatures.join(', ')}. `;
    }
    
    return `${message}\n\nLocation context: ${locationContext}Relevant info: ${geodeticEnhancedContext}`;
  }
  
  // Background intelligence: context without forcing location mentions
  return message + (geodeticEnhancedContext && geodeticEnhancedContext !== docContext ? 
    `\nRelevant context: ${geodeticEnhancedContext}` : '');
}

// --- Natural Location Context Integration ---
async function enrichWithNaturalLocationContext(reply, msgLower, userLocation) {
  // Only add Mount Hope context when conversation naturally calls for it
  const locationTriggers = ['mount hope', 'mounthope', 'here', 'local', 'around here', 
                           'our town', 'our community', 'this area', 'where i live',
                           'my area', 'this place', 'hometown'];
  
  const needsLocalContext = locationTriggers.some(trigger => msgLower.includes(trigger));
  
  if (needsLocalContext && userLocation?.withinMountHopeArea) {
    reply += "\n\nMount Hope is a beautiful community here in West Virginia, and I'm proud to call it home!";
    
    // Add specific geodetic context if available
    if (userLocation?.elevation && userLocation.elevation > 2000) {
      reply += " These mountain elevations give us some of the most beautiful views in Appalachia!";
    }
  }
  
  return reply;
}

// --- Main Conversation Processing with Enhanced Geodetic Intelligence ---
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
    // Enhanced geodetic location processing
    const rawLocationData = requestMetadata.location || {
      coordinates: MOUNT_HOPE_COORDINATES,
      source: 'default'
    };
    
    const userLocation = await enrichUserLocationWithGeodetic(rawLocationData);

    // Geodetic-informed memory and document retrieval
    const relevantMemories = await gpsEnhancedMemory.retrieveLocationRelevantMemories(
      userId, message, userLocation, 3
    );
    
    const relevantDocs = docsearch.searchDocuments(message, msDocs, 2);
    const docContext = relevantDocs.map(doc => doc.paragraph.slice(0, 150)).join(' ');
    
    // Background-aware prompt building with geodetic intelligence
    const finalPrompt = buildFinalPrompt(message, userLocation, docContext);

    console.log('🔧 Processing with enhanced geodetic intelligence:', message.substring(0, 50) + '...');
    console.log('🔧 User location:', userLocation.locationSource);
    console.log('🔧 Geodetic-aware prompt length:', finalPrompt.length);

    let reply = await fetchAIResponse(finalPrompt);
    
    // Natural enrichment based on conversation context
    reply = await enrichWithNaturalLocationContext(reply, message.toLowerCase(), userLocation);

    // Store with enhanced geodetic metadata
    gpsEnhancedMemory.storeMemory(userId, message, reply, { 
      geodetic_enhanced_intelligence: true,
      location_relevance: needsCulturalContext(message, userLocation),
      spatial_metadata: {
        coordinates: userLocation.coordinates,
        elevation: userLocation.elevation,
        distanceFromMountHope: userLocation.distanceFromMountHope,
        terrainFeatures: userLocation.terrainFeatures,
        geodeticPrecision: userLocation.geodeticMetadata?.precision
      }
    }, userLocation);

    console.log('✅ Successfully processed with enhanced geodetic intelligence');

    return {
      reply: reply.trim(),
      agent: "Ms. Jarvis",
      time: Date.now(),
      userLocation,
      consultation: {
        specialists: ["ms_jarvis_geodetic_enhanced_intelligence"],
        confidence: "high",
        processingMode: "geodetic_enhanced_background_intelligence",
        processingTime: Date.now() - startTime,
        gpsLocationData: {
          coordinatesUsed: userLocation.coordinates,
          locationType: userLocation.locationType,
          locationSource: userLocation.locationSource,
          confidence: userLocation.confidence,
          withinWV: true,
          withinMountHopeArea: userLocation.withinMountHopeArea,
          geodeticEnhanced: true,
          elevation: userLocation.elevation,
          terrainFeatures: userLocation.terrainFeatures,
          nearbyLandmarks: userLocation.nearbyLandmarks,
          distanceFromMountHope: userLocation.distanceFromMountHope
        }
      }
    };

  } catch (error) {
    console.error("Geodetic enhanced intelligence error:", error.message);
    console.error("Geodetic enhanced intelligence error stack:", error.stack);
    const total = Date.now() - startTime;
    const fallbackReply = "Sugar, I'm having a little trouble right now. If you can share your GPS or the town you're asking about, I'll tailor the answer right to your spot on the map.";

    try {
      const fallbackLocation = {
        locationType: 'fallback',
        locationSource: 'Mount Hope, WV fallback',
        confidence: 'low'
      };
      
      gpsEnhancedMemory.storeMemory(userId, message, fallbackReply, { 
        fallback: true, 
        geodetic_enhanced_intelligence: true,
        error: error.message 
      }, fallbackLocation);

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
            geodeticEnhancedIntelligence: true
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
        processingMode: "fallback_with_geodetic_enhanced_intelligence",
        processingTime: total,
        fallbackReason: error.message
      }
    };
  }
};
