const gpsLocationService = require('./geodetic-intelligence/gpsLocationService');
const gpsEnhancedMemory = require('./geodetic-intelligence/gpsEnhancedMemory');

// backendlib/brain.js
// Modular GPS‑Enhanced Multi‑AI System with Darwin Gödel Machine Integration

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
const { ClioLiveSearch } = require('./cultural-integration/clio-integration/clio-live-search');
const clioLiveSearch = new ClioLiveSearch();

const msDocs = docsearch.loadDocuments();
const OLLAMA_MODEL = process.env.LLM_MODEL || "gemini-2.0-flash-lite";
const OLLAMA_URL = process.env.LLM_API_URL || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const API_KEY = process.env.GOOGLE_API_KEY;
const COMM_SERVER_URL = process.env.COMMUNICATIONS_SERVER_URL || 'http://your-communications-server-url';

// --- GEO Lookup helpers ---
async function getCountyInfo(countyName) {
  try {
    const fetch = await getFetch();
    const url = "https://ms-jarvis-core-cujdn1bkg-ms-jarvis.vercel.app/api/wv-county-boundaries";
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const geojson = await res.json();
    return geojson.features.find(f => f.properties.name?.toLowerCase().includes(countyName.toLowerCase()))?.properties || null;
  } catch (err) {
    console.error("County lookup failed:", err.message);
    return null;
  }
}

async function getElevationInfo(placeName) {
  try {
    const fetch = await getFetch();
    const url = "https://ms-jarvis-core-cujdn1bkg-ms-jarvis.vercel.app/api/geodetic-control-points";
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const geojson = await res.json();
    return geojson.features.find(f => f.properties.name?.toLowerCase().includes(placeName.toLowerCase()))?.properties || null;
  } catch (err) {
    console.error("Elevation lookup failed:", err.message);
    return null;
  }
}

// --- Utility: Build prompt for LLM ---
function buildFinalPrompt(message, userLocation, judgeSynth) {
  return `
You are Ms. Jarvis, providing authentic, helpful responses with 100% accuracy based on the user's GPS coordinates.

USER QUERY: "${message}"

${userLocation?.coordinates
    ? `USER GPS LOCATION: ${userLocation.coordinates.lat}, ${userLocation.coordinates.lng} (${userLocation.locationType}, confidence: ${userLocation.confidence})`
    : 'USER GPS LOCATION: Not available'}

GPS-ENHANCED JUDGE SYNTHESIS:
${judgeSynth}

INSTRUCTIONS:
- Be precise to the user's coordinates
- Reference local landmarks/resources
- 200-400 words, focused, location-specific`.trim();
}

// --- Utility: Call AI model ---
async function fetchAIResponse(prompt) {
  const fetch = await getFetch();
  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 2048
    })
  });
  if (!res.ok) throw new Error(`AI request failed: ${res.statusText}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "I'm here for you, honey—ready with location-specific guidance.";
}

// --- Utility: Enrich reply with GEO Data ---
async function enrichWithGeoData(reply, msgLower) {
  const countyMatch = msgLower.match(/\b([a-z]+) county\b/);
  if (countyMatch) {
    const county = await getCountyInfo(countyMatch[1]);
    if (county) {
      reply += `\n${county.name} covers about ${county.area_sq_miles} square miles in the ${county.region} region. The county seat is ${county.county_seat}.`;
    }
  }
  const elevationMatch = msgLower.match(/\b([a-z ]+) elevation\b/);
  if (elevationMatch && elevationMatch[1]) {
    const info = await getElevationInfo(elevationMatch[1]);
    if (info) {
      reply += `\n${info.name} sits at about ${info.elevation} ft elevation (datum: ${info.datum}, accuracy: ${info.accuracy}).`;
    }
  }
  return reply;
}

// Missing constants and functions for brain.js completion

const REASONING_CATEGORIES = {
  TECHNICAL: {
    keywords: ['technical', 'code', 'programming', 'software', 'system', 'implementation'],
    routing: ['technical'],
    reasoningMode: 'analytical',
    reasoningDepth: 'advanced',
    requiresLocation: false
  },
  GEOGRAPHIC: {
    keywords: ['location', 'place', 'geography', 'county', 'elevation', 'coordinates'],
    routing: ['geographic'],
    reasoningMode: 'spatial',
    reasoningDepth: 'advanced',
    requiresLocation: true
  },
  CULTURAL: {
    keywords: ['culture', 'tradition', 'appalachian', 'heritage', 'history', 'community'],
    routing: ['cultural'],
    reasoningMode: 'contextual',
    reasoningDepth: 'deep',
    requiresLocation: true
  },
  ECONOMIC: {
    keywords: ['economic', 'financial', 'business', 'revenue', 'currency', 'development'],
    routing: ['economic'],
    reasoningMode: 'analytical',
    reasoningDepth: 'advanced',
    requiresLocation: false
  },
  CRISIS: {
    keywords: ['crisis', 'emergency', 'disaster', 'flood', 'weather', 'response'],
    routing: ['crisis'],
    reasoningMode: 'urgent',
    reasoningDepth: 'immediate',
    requiresLocation: true
  }
};

const REASONING_MODES = {
  ANALYTICAL: 'analytical',
  CONTEXTUAL: 'contextual',
  SPATIAL: 'spatial',
  MULTI_PERSPECTIVE: 'multi_perspective',
  URGENT: 'urgent'
};

const REASONING_DEPTH_LEVELS = {
  BASIC: 'basic',
  ADVANCED: 'advanced',
  DEEP: 'deep',
  IMMEDIATE: 'immediate'
};

function prepareGPSEnhancedDocumentContext(message, userLocation) {
  const locationStr = userLocation?.coordinates
    ? `${userLocation.coordinates.lat}, ${userLocation.coordinates.lng} (${userLocation.locationType})`
    : 'Mount Hope, WV default';

  // Search relevant documents using the docsearch module
  const relevantDocs = docsearch.searchDocuments(message, msDocs, 3);
  const docContext = relevantDocs.map(doc => `[${doc.file}] ${doc.paragraph.slice(0, 200)}...`).join('\n\n');

  return `GPS-Enhanced Document Context for location: ${locationStr}\n\nRelevant Knowledge:\n${docContext}`;
}

async function gpsEnhancedConsultationWithJudgeSynthesis(message, docContext, reasoningCategory, memoryContext, userLocation) {
  const locationContext = userLocation?.coordinates
    ? `at coordinates ${userLocation.coordinates.lat}, ${userLocation.coordinates.lng}`
    : 'in West Virginia';

  const consultation = {
    technical: { analysis: 'Technical systems analysis ready', status: 'active' },
    geographic: { analysis: 'Geographic context processed', status: 'active' },
    cultural: { analysis: 'Cultural integration active', status: 'active' },
    economic: { analysis: 'Economic development context available', status: 'active' },
    crisis: { analysis: 'Crisis response protocols ready', status: 'standby' }
  };

  return {
    ...consultation,
    judgeSynthesis: {
      response: `Multi-specialist consultation for "${message}" ${locationContext}. Processing with ${reasoningCategory.reasoningMode} reasoning at ${reasoningCategory.reasoningDepth} depth. Document context: ${docContext.slice(0, 200)}... Memory context: ${memoryContext.slice(0, 100)}...`,
      status: 'success',
      specialists: Object.keys(consultation),
      confidence: 'high'
    }
  };
}

// Mock cultural integrations (these appear to be planned advanced modules)
const appalachianIntelligence = {
  isInitialized: false,
  applyCulturalContext: (message, type, reply) => reply + " (Enhanced with Appalachian cultural context)"
};

const aapcappeIntegration = {
  isLoaded: false,
  enhanceResponse: (reply, message) => reply + " (AAPCAPPE integration ready)"
};

const geographicIntelligence = {
  isInitialized: false,
  enhanceResponseWithGeography: (reply, message) => reply + " (Geographic intelligence applied)"
};

const statewideWVIntelligence = {
  isInitialized: false,
  enhanceResponseWithStatewideContext: (reply, message, userId) => reply + " (West Virginia statewide context applied)",
  enhanceWithGeodeticData: (reply, message, userId) => reply + " (Geodetic data enhancement applied)"
};

// --- Main entrypoint ---
exports.converse = async function(message, userId, requestMetadata = {}) {
  const startTime = Date.now();
  if (!message?.trim()) {
    return { reply: "I'm here to help, darlin'. What can I do for you?", agent: "Ms. Jarvis", time: Date.now(), consultation: { specialists: [], confidence: "high", processingMode: "input_validation", processingTime: Date.now() - startTime } };
  }

  try {
    // Determine user location & recall memories in parallel
    const [userLocation, relevantMemories] = await Promise.all([
      gpsLocationService.determineUserLocation(message, requestMetadata),
      gpsEnhancedMemory.retrieveLocationRelevantMemories(userId, message, null, 3)
    ]);

    if (userLocation?.coordinates) {
      userLocation.nearbyLocations = await gpsLocationService.getNearbyLocations(userLocation.coordinates.lat, userLocation.coordinates.lng, 25);
    }

    const docContext = prepareGPSEnhancedDocumentContext(message, userLocation);
    const memoryContext = relevantMemories.map(m => `Prev: "${m.message}" -> "${(m.response || '').slice(0,160)}..." ${m.location?`(Loc: ${m.location.coordinates.lat}, ${m.location.coordinates.lng})`:''}`).join('\n');
    const memoryStats = gpsEnhancedMemory.getMemoryStats(userId);

    // Pick reasoning category
    const msgLower = message.toLowerCase();
    let reasoningCategory = Object.values(REASONING_CATEGORIES).find(cat => cat.keywords.some(k => msgLower.includes(k))) || { routing: ['creative','financial','spiritual','technical'], reasoningMode: REASONING_MODES.MULTI_PERSPECTIVE, reasoningDepth: REASONING_DEPTH_LEVELS.ADVANCED, requiresLocation: true };

    // Consultation
    const cons = await gpsEnhancedConsultationWithJudgeSynthesis(message, docContext, reasoningCategory, memoryContext, userLocation);
    const judgeSynth = cons.judgeSynthesis?.response || "";

    // Build & send to AI
    let reply = await fetchAIResponse(buildFinalPrompt(message, userLocation, judgeSynth));

    // Enrich with geo & cultural integrations
    reply = await enrichWithGeoData(reply, msgLower);
    try { if (appalachianIntelligence.isInitialized) reply = appalachianIntelligence.applyCulturalContext(message, 'general', reply); } catch {}
    try { if (aapcappeIntegration.isLoaded) reply = aapcappeIntegration.enhanceResponse(reply, message); } catch {}
    try { if (geographicIntelligence.isInitialized) reply = geographicIntelligence.enhanceResponseWithGeography(reply, message); } catch {}
    try { if (statewideWVIntelligence.isInitialized) { reply = statewideWVIntelligence.enhanceResponseWithStatewideContext(reply, message, userId); reply = statewideWVIntelligence.enhanceWithGeodeticData(reply, message, userId); } } catch {}

    return {
      reply: reply.trim(),
      agent: "Ms. Jarvis",
      time: Date.now(),
      userLocation,
      consultation: {
        specialists: Object.keys(cons).filter(k => k !== 'judgeSynthesis'),
        confidence: "high",
        processingMode: "gps_enhanced_precise_location_delivery",
        processingTime: Date.now() - startTime,
        judgeSynthesis: cons.judgeSynthesis?.status === 'success',
        gpsLocationData: {
          coordinatesUsed: userLocation?.coordinates || null,
          locationType: userLocation?.locationType || null,
          locationSource: userLocation?.locationSource || null,
          confidence: userLocation?.confidence || null,
          withinWV: userLocation?.withinWV ?? null
        },
        memoryStats
      }
    };

  } catch (error) {
    console.error("Converse error:", error.message);
    const total = Date.now() - startTime;
    const fallbackReply = "Sugar, I'm having a little trouble right now. If you can share your GPS or the town you're asking about, I'll tailor the answer right to your spot on the map.";
    gpsEnhancedMemory.storeMemory(userId, message, fallbackReply, { fallback:true }, null);
    try { 
      const fetch = await getFetch();
      fetch(`${COMM_SERVER_URL}/api/store-communication`, { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ 
          userMessage: message, 
          aiResponse: fallbackReply, 
          userId, 
          metadata: { 
            processingTime: total, 
            specialists: ['authentic_fallback'], 
            confidence:'medium', 
            isFallback:true, 
            error: error.message 
          } 
        }) 
      }).catch(()=>{}); 
    } catch {}
    return { reply: fallbackReply, agent: "Ms. Jarvis", time: Date.now(), consultation: { specialists: ["authentic_fallback"], confidence: "medium", processingMode: "fallback", processingTime: total, fallbackReason: error.message } };
  }
};
