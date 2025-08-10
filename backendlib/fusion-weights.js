/ backendlib/brain.js
// GPS-Enhanced Multi-AI System with Darwin Gödel Machine Integration + Confidence-Weighted Fusion
const { ContinuousLearningEngine } = require('./continuous-learning');
const learningEngine = new ContinuousLearningEngine();

const fs = require('fs');
const fetch = require('node-fetch');
const docsearch = require('./docsearch');
const crypto = require('crypto');

const { ClioLiveSearch } = require('./cultural-integration/clio-integration/clio-live-search');
const clioLiveSearch = new ClioLiveSearch();
const msDocs = docsearch.loadDocuments();

const OLLAMA_MODEL = process.env.LLM_MODEL || "gemini-2.0-flash-lite";
const OLLAMA_URL = process.env.LLM_API_URL || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const API_KEY = process.env.GOOGLE_API_KEY;
const COMMUNICATIONS_SERVER_URL = process.env.COMMUNICATIONS_SERVER_URL || 'http://your-communications-server-url';

// Confidence-weighted fusion module
const { FusionWeights } = require('./fusion-weights');
const fusionWeights = new FusionWeights();

console.log('🔍 GOOGLE GEMINI AUTHENTICATION DEBUG:');
console.log(' API_KEY exists:', !!API_KEY);
console.log(' API_KEY length:', API_KEY ? API_KEY.length : 0);
console.log(' API_KEY starts with AIza:', API_KEY ? API_KEY.startsWith('AIza') : false);
console.log(' OLLAMA_URL:', OLLAMA_URL);
console.log(' OLLAMA_MODEL:', OLLAMA_MODEL);
console.log('🗄️ COMMUNICATIONS SERVER:', COMMUNICATIONS_SERVER_URL);
console.log('🛰️ GPS LOCATION SERVICES: ENABLED');

const REASONING_DEPTH_LEVELS = { BASIC: 1, INTERMEDIATE: 2, ADVANCED: 3, EXPERT: 4 };
const REASONING_MODES = { CHAIN_OF_THOUGHT: 'cot', STEP_BY_STEP: 'step', CAUSAL_ANALYSIS: 'causal', MULTI_PERSPECTIVE: 'multi' };

const MAX_CONSULTATION_TIME = 45000;
const INDIVIDUAL_AI_TIMEOUT = 35000;
const CACHE_TTL = 30 * 60 * 1000;

const GPS_CONFIG = {
enableLocationServices: true,
fallbackLocation: { lat: 38.5976, lng: -80.4549 },
locationAccuracyRadius: 100,
maxLocationAge: 300000,
locationTimeout: 10000
};

const WV_BOUNDARIES = { north: 40.6384, south: 37.2015, east: -77.7190, west: -82.6447 };

const MOUNTAINSHARES_PRIORITY_DOCS = [
'MountainShares Darwin Gödel Machine_ AI-Powered Sy.txt',
'The Role of the MountainShares Darwin Gödel Machin.txt',
'MountainShares Governance System - Technical Docum.txt',
'MountainShares Community Economic Development.txt',
'MountainShares Heritage NFT Platform.txt',
'MountainShares Crisis Response Protocol.txt',
'MountainShares Employee Rewards System.txt'
];

// -------------------- GPS Location Service --------------------
class GPSLocationService {
constructor() { this.isEnabled = GPS_CONFIG.enableLocationServices; }

isWithinWestVirginia(lat, lng) {
return lat >= WV_BOUNDARIES.south && lat <= WV_BOUNDARIES.north &&
lng >= WV_BOUNDARIES.west && lng <= WV_BOUNDARIES.east;
}

isValidCoordinates(lat, lng) {
return typeof lat === 'number' && typeof lng === 'number' &&
!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

extractGPSFromRequest(request) {
try {
const sources = [request?.gpsLocation, request?.coordinates, request?.location, request?.userLocation, request?.clientLocation];
for (const source of sources) {
if (source && typeof source.lat !== 'undefined' && typeof source.lng !== 'undefined') {
const lat = parseFloat(source.lat);
const lng = parseFloat(source.lng);
if (this.isValidCoordinates(lat, lng)) {
console.log(🛰️ GPS coordinates detected: ${lat}, ${lng});
return { lat, lng, accuracy: source.accuracy || null, timestamp: source.timestamp || Date.now(), source: 'gps_device' };
}
}
}
return null;
} catch (e) {
console.log('⚠️ GPS extraction error:', e.message);
return null;
}
}

async determineUserLocation(message, requestMetadata = {}) {
const gpsLocation = this.extractGPSFromRequest(requestMetadata);

text
if (gpsLocation && this.isWithinWestVirginia(gpsLocation.lat, gpsLocation.lng)) {
  return { coordinates: { lat: gpsLocation.lat, lng: gpsLocation.lng }, accuracy: gpsLocation.accuracy, locationType: 'gps_device', locationSource: 'user_device_gps', confidence: 'high', withinWV: true };
}

const explicitLocation = clioLiveSearch.detectLocationFromQuery(message || '');
if (explicitLocation && explicitLocation.coordinates) {
  return { coordinates: explicitLocation.coordinates, locationType: explicitLocation.locationType, locationName: explicitLocation.locationName, locationSource: 'explicit_request', confidence: 'high', withinWV: this.isWithinWestVirginia(explicitLocation.coordinates.lat, explicitLocation.coordinates.lng) };
}

if (gpsLocation && !this.isWithinWestVirginia(gpsLocation.lat, gpsLocation.lng)) {
  return { coordinates: GPS_CONFIG.fallbackLocation, userActualLocation: { lat: gpsLocation.lat, lng: gpsLocation.lng }, locationType: 'fallback_wv_center', locationSource: 'gps_outside_wv', confidence: 'medium', withinWV: false };
}

return { coordinates: GPS_CONFIG.fallbackLocation, locationType: 'state_center', locationSource: 'fallback', confidence: 'low', withinWV: true };
}

calculateDistance(lat1, lng1, lat2, lng2) {
const R = 3959;
const dLat = this.toRad(lat2 - lat1);
const dLng = this.toRad(lng2 - lng1);
const a = Math.sin(dLat/2)**2 + Math.cos(this.toRad(lat1))*Math.cos(this.toRad(lat2))*Math.sin(dLng/2)**2;
return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
toRad(d) { return d * (Math.PI / 180); }

async getNearbyLocations(lat, lng, radiusMiles = 25) {
const out = [];
for (const [name, data] of clioLiveSearch.locationDatabase.cities.entries()) {
const dist = this.calculateDistance(lat, lng, data.lat, data.lng);
if (dist <= radiusMiles) out.push({ name, type: 'city', distance: Math.round(dist10)/10, coordinates: { lat: data.lat, lng: data.lng }, county: data.county });
}
for (const [name, data] of clioLiveSearch.locationDatabase.counties.entries()) {
const dist = this.calculateDistance(lat, lng, data.lat, data.lng);
if (dist <= radiusMiles) out.push({ name: ${name} County, type: 'county', distance: Math.round(dist10)/10, coordinates: { lat: data.lat, lng: data.lng }, region: data.region });
}
return out.sort((a,b)=>a.distance-b.distance).slice(0,10);
}
}
const gpsLocationService = new GPSLocationService();

// -------------------- Specialists and Judge --------------------
const AI_SPECIALISTS = {
creative: { role: "Creative AI Specialist with GPS-Aware Reasoning", prompt: "Provide 2-3 GPS-aware creative insights.", weight: 0.25, timeout: INDIVIDUAL_AI_TIMEOUT, reasoningLevel: REASONING_DEPTH_LEVELS.ADVANCED },
technical: { role: "Technical AI Specialist with Geodetic Precision", prompt: "Provide 2-3 geodetically precise technical insights.", weight: 0.30, timeout: INDIVIDUAL_AI_TIMEOUT, reasoningLevel: REASONING_DEPTH_LEVELS.EXPERT },
spiritual: { role: "Spiritual AI Specialist with Place-Based Wisdom", prompt: "Provide 2-3 place-based spiritual insights.", weight: 0.20, timeout: INDIVIDUAL_AI_TIMEOUT, reasoningLevel: REASONING_DEPTH_LEVELS.INTERMEDIATE },
financial: { role: "Financial AI Specialist with Geographic Economic Analysis", prompt: "Provide 2-3 geographically informed financial insights.", weight: 0.25, timeout: INDIVIDUAL_AI_TIMEOUT, reasoningLevel: REASONING_DEPTH_LEVELS.ADVANCED }
};

const JUDGE_AI = { role: "GPS-Enhanced Judge AI", prompt: "Synthesize into a location-precise plan with USER_LOCATION, PRIMARY_FOCUS, KEY_MESSAGE_1..3, DELIVERY_STYLE, LOCAL_RESOURCES, AVOID.", weight: 1.0, timeout: INDIVIDUAL_AI_TIMEOUT };

const REASONING_CATEGORIES = {
historical_stories: { keywords: ['historical','stories','history','heritage','clio','coal','mining','sites'], routing: ['creative','spiritual'], reasoningMode: REASONING_MODES.CHAIN_OF_THOUGHT, reasoningDepth: REASONING_DEPTH_LEVELS.INTERMEDIATE, requiresLocation: true },
local_information: { keywords: ['near me','local','nearby','around here','in my area','close by'], routing: ['creative','technical','spiritual','financial'], reasoningMode: REASONING_MODES.MULTI_PERSPECTIVE, reasoningDepth: REASONING_DEPTH_LEVELS.ADVANCED, requiresLocation: true },
coding: { keywords: ['solidity','smart contract','python','javascript','react','api','algorithm','code','function','class'], routing: ['technical','creative','financial'], reasoningMode: REASONING_MODES.STEP_BY_STEP, reasoningDepth: REASONING_DEPTH_LEVELS.EXPERT, requiresLocation: false },
ai_systems: { keywords: ['darwin','gödel','goedel','godel','machine','ai','artificial','intelligence','reasoning','analysis'], routing: ['technical','creative','spiritual','financial'], reasoningMode: REASONING_MODES.MULTI_PERSPECTIVE, reasoningDepth: REASONING_DEPTH_LEVELS.EXPERT, requiresLocation: false },
community_planning: { keywords: ['community','planning','development','sustainability','cultural','heritage','economic','social'], routing: ['creative','spiritual','financial','technical'], reasoningMode: REASONING_MODES.CAUSAL_ANALYSIS, reasoningDepth: REASONING_DEPTH_LEVELS.ADVANCED, requiresLocation: true },
problem_solving: { keywords: ['problem','challenge','issue','solution','analyze','resolve','fix','improve'], routing: ['creative','technical','spiritual','financial'], reasoningMode: REASONING_MODES.CHAIN_OF_THOUGHT, reasoningDepth: REASONING_DEPTH_LEVELS.ADVANCED, requiresLocation: false }
};

// -------------------- Caching --------------------
const responseCache = new Map();
const consultationCache = new Map();
function getCacheKey(message, location = null) {
const baseKey = crypto.createHash('sha256').update(String(message).toLowerCase().trim()).digest('hex').slice(0,16);
if (location?.coordinates && typeof location.coordinates.lat === 'number' && typeof location.coordinates.lng === 'number') {
const locKey = ${location.coordinates.lat}_${location.coordinates.lng};
return ${baseKey}_${locKey};
}
return baseKey;
}

// -------------------- Prompts --------------------
function generateGPSEnhancedReasoningPrompt(userMessage, reasoningCategory, userLocation) {
const reasoningMode = reasoningCategory?.reasoningMode || REASONING_MODES.CHAIN_OF_THOUGHT;
const locationBlock = userLocation?.coordinates ? `GPS LOCATION CONTEXT:

User Coordinates: ${userLocation.coordinates.lat}, ${userLocation.coordinates.lng}

Location Type: ${userLocation.locationType}

Source: ${userLocation.locationSource}

Confidence: ${userLocation.confidence}

Within WV: ${userLocation.withinWV}
${userLocation.locationName ? - Name: ${userLocation.locationName} : ''}: ''; return${locationBlock}\nMode: ${reasoningMode}. Provide location-precise reasoning.`;
}

// -------------------- Document Context --------------------
function prepareGPSEnhancedDocumentContext(message, userLocation) {
const key = gps_doc_${getCacheKey(message, userLocation)};
const cached = consultationCache.get(key);
if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

let docContext = "";
const messageLower = String(message).toLowerCase();

for (const file of MOUNTAINSHARES_PRIORITY_DOCS) {
if (!msDocs[file]) continue;
const content = msDocs[file];
const cLower = content.toLowerCase();
let matches = 0;
messageLower.split(' ').filter(w=>w.length>3).forEach(w=>{ if (cLower.includes(w)) matches++; });
if (userLocation?.locationName) {
userLocation.locationName.toLowerCase().split(' ').forEach(term=>{ if (cLower.includes(term)) matches+=0.5; });
}
if (matches>0) {
const sections = content.split(/\n\s*\n/).slice(0,8).join('\n\n');
docContext += [${file.replace('.txt','')}] (Relevance: ${matches}): ${sections.slice(0,2000)}\n\n---\n\n;
}
}

if (docContext.length<300) {
const results = docsearch.searchDocuments(message, msDocs, 5);
if (Array.isArray(results) && results.length>0) {
docContext = results.map(r=>[${r.file.replace('.txt','')}]: ${r.paragraph.slice(0,600)}).join('\n\n---\n\n');
}
}

if (userLocation?.coordinates) {
docContext += \n\n[GPS LOCATION CONTEXT]\nUser Coordinates: ${userLocation.coordinates.lat}, ${userLocation.coordinates.lng}\nLocation Source: ${userLocation.locationSource}\nConfidence: ${userLocation.confidence};
}

consultationCache.set(key, { timestamp: Date.now(), data: docContext });
return docContext;
}

// -------------------- GPS-Enhanced Memory System --------------------
class GPSEnhancedMemorySystem {
constructor() {
this.workingMemory = new Map();
this.shortTermMemory = new Map();
this.longTermMemory = new Map();
this.locationMemory = new Map();
this.memoryIndex = new Map();
this.maxWorkingMemory = 10; this.maxShortTermMemory = 50; this.maxLongTermMemory = 500;
}

storeMemory(userId, message, response, context, userLocation = null) {
const timestamp = Date.now();
const memoryEntry = {
id: ${userId}_${timestamp},
userId, message, response, context, timestamp,
importance: this.calculateImportance(message, response),
topics: this.extractTopics(${message} ${response}),
location: (userLocation?.coordinates && typeof userLocation.coordinates.lat === 'number' && typeof userLocation.coordinates.lng === 'number')
? { coordinates: userLocation.coordinates, locationType: userLocation.locationType, locationName: userLocation.locationName, accuracy: userLocation.accuracy }
: null
};

text
if (!this.workingMemory.has(userId)) this.workingMemory.set(userId, []);
const wm = this.workingMemory.get(userId);
wm.push(memoryEntry);

if (memoryEntry.location?.coordinates) {
  const lat = memoryEntry.location.coordinates.lat;
  const lng = memoryEntry.location.coordinates.lng;
  const locationKey = `${Math.round(lat * 100)}_${Math.round(lng * 100)}`;
  if (!this.locationMemory.has(locationKey)) this.locationMemory.set(locationKey, []);
  this.locationMemory.get(locationKey).push(memoryEntry);
}

if (wm.length > this.maxWorkingMemory) {
  const old = wm.shift();
  this.promoteToShortTerm(old);
}
this.updateMemoryIndex(memoryEntry);
}

retrieveLocationRelevantMemories(userId, currentMessage, userLocation, limit=5) {
const all = [];
if (this.workingMemory.has(userId)) all.push(...this.workingMemory.get(userId));
if (this.shortTermMemory.has(userId)) all.push(...this.shortTermMemory.get(userId));
if (this.longTermMemory.has(userId)) all.push(...this.longTermMemory.get(userId));

text
if (userLocation?.coordinates && typeof userLocation.coordinates.lat === 'number' && typeof userLocation.coordinates.lng === 'number') {
  const locationKey = `${Math.round(userLocation.coordinates.lat * 100)}_${Math.round(userLocation.coordinates.lng * 100)}`;
  if (this.locationMemory.has(locationKey)) all.push(...this.locationMemory.get(locationKey));
}

const scored = all.map(m=>({ ...m, relevanceScore: this.calculateLocationRelevance(m, currentMessage, userLocation) }))
                  .sort((a,b)=> (b.relevanceScore - a.relevanceScore) || (b.timestamp - a.timestamp));
return scored.slice(0, limit);
}

calculateLocationRelevance(memory, currentMessage, userLocation) {
let relevance = this.calculateRelevance(memory, currentMessage);
if (memory.location?.coordinates && userLocation?.coordinates) {
const d = gpsLocationService.calculateDistance(memory.location.coordinates.lat, memory.location.coordinates.lng, userLocation.coordinates.lat, userLocation.coordinates.lng);
if (d <= 10) relevance += 0.3 * (1 - d/10);
}
return Math.min(relevance, 1.0);
}

promoteToShortTerm(entry) {
if (!this.shortTermMemory.has(entry.userId)) this.shortTermMemory.set(entry.userId, []);
const arr = this.shortTermMemory.get(entry.userId);
arr.push(entry);
if (arr.length > this.maxShortTermMemory) {
const old = arr.shift();
if (old.importance > 0.7) this.promoteToLongTerm(old);
}
}
promoteToLongTerm(entry) {
if (!this.longTermMemory.has(entry.userId)) this.longTermMemory.set(entry.userId, []);
const arr = this.longTermMemory.get(entry.userId);
arr.push(entry);
if (arr.length > this.maxLongTermMemory) arr.shift();
}

calculateImportance(message, response) {
const kws = ['problem','solution','help','important','critical','urgent','mountainshares','community','local','nearby'];
let imp = 0.5; const text = ${message} ${response}.toLowerCase();
kws.forEach(k=>{ if (text.includes(k)) imp += 0.1; });
if (response && response.length > 500) imp += 0.1;
if (response && response.length > 1000) imp += 0.1;
return Math.min(imp, 1.0);
}
calculateRelevance(memory, currentMessage) {
const a = ${memory.message} ${memory.response}.toLowerCase(); const b = String(currentMessage).toLowerCase();
const A = new Set(a.split(' ').filter(w=>w.length>3)); const B = new Set(b.split(' ').filter(w=>w.length>3));
const inter = [...A].filter(w=>B.has(w)); const union = new Set([...A,...B]);
return union.size ? inter.length/union.size : 0;
}
extractTopics(text) {
const map = { technical:['code','programming','system','technical','algorithm','software'], creative:['creative','art','design','innovation','artistic'], financial:['financial','money','budget','economic','investment'], spiritual:['spiritual','community','values','ethics','wisdom'], mountainshares:['mountainshares','darwin','godel','heritage','appalachian'], local:['local','nearby','near me','around here','in my area'] };
const topics=[]; const lower=String(text).toLowerCase();
Object.entries(map).forEach(([topic, kws])=>{ if (kws.some(k=>lower.includes(k))) topics.push(topic); });
return topics;
}
updateMemoryIndex(entry) {
entry.topics.forEach(t=>{ if (!this.memoryIndex.has(t)) this.memoryIndex.set(t, []); this.memoryIndex.get(t).push(entry.id); });
}
getMemoryStats(userId) {
return { workingMemory: this.workingMemory.get(userId)?.length || 0, shortTermMemory: this.shortTermMemory.get(userId)?.length || 0, longTermMemory: this.longTermMemory.get(userId)?.length || 0, locationMemoryKeys: this.locationMemory.size, totalMemories: (this.workingMemory.get(userId)?.length || 0) + (this.shortTermMemory.get(userId)?.length || 0) + (this.longTermMemory.get(userId)?.length || 0) };
}
}
const gpsEnhancedMemory = new GPSEnhancedMemorySystem();

// -------------------- Integrations --------------------
const { AppalachianCulturalIntelligence } = require('./cultural-integration/appalachian-intelligence');
const appalachianIntelligence = new AppalachianCulturalIntelligence();
const { AAPCAppEIntegration } = require('./cultural-integration/aapcappe-integration');
const aapcappeIntegration = new AAPCAppEIntegration();
const { TheClioIntegration } = require('./cultural-integration/clio-integration/the-clio-integration');
const theClioIntegration = new TheClioIntegration();
const { GeographicIntelligence } = require('./geographic/geographic-intelligence');
const geographicIntelligence = new GeographicIntelligence();
const { StatewideWVIntelligence } = require('./geographic/statewide-wv-intelligence');
const statewideWVIntelligence = new StatewideWVIntelligence();

(async()=>{ try{ await clioLiveSearch.initialize(); }catch{} })();
(async()=>{ try{ await appalachianIntelligence.initialize(); }catch{} })();
(async()=>{ try{ await aapcappeIntegration.initialize(); }catch{} })();
(async()=>{ try{ await theClioIntegration.initialize(); }catch{} })();
(async()=>{ try{ await geographicIntelligence.initialize(); await statewideWVIntelligence.initialize(); }catch{} })();

// -------------------- Consultation + Judge (with Fusion) --------------------
async function gpsEnhancedConsultationWithJudgeSynthesis(message, docContext, reasoningCategory, memoryContext, userLocation) {
const consultationStartTime = Date.now();
const cacheKey = getCacheKey(${message}|${(reasoningCategory?.routing||[]).join(',')}|synth, userLocation);
const cached = responseCache.get(cacheKey);
if (cached && Date.now()-cached.timestamp < CACHE_TTL) return cached.data;

const aiList = reasoningCategory?.routing || ['creative','financial','spiritual','technical'];
const consultationResults = {};
const reasoningPrompt = generateGPSEnhancedReasoningPrompt(message, reasoningCategory, userLocation);

const consultationPromises = aiList.map(async (aiType)=>{
const specialist = AI_SPECIALISTS[aiType]; if (!specialist) return null;

text
const enhancedPrompt = `
${specialist.prompt}

GPS-ENHANCED REASONING INTEGRATION:
${reasoningPrompt}

ORGANIZATIONAL CONTEXT:
${docContext}

MEMORY CONTEXT:
${memoryContext}

USER QUERY: ${message}

CRITICAL: Provide 2-3 focused insights that are 100% accurate for the user's GPS coordinates.`.trim();

text
const aiStart = Date.now();
try {
  const response = await Promise.race([
    fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({ model: OLLAMA_MODEL, messages: [{ role: "user", content: enhancedPrompt }], temperature: 0.7, max_tokens: 1024 })
    }),
    new Promise((_, reject)=>setTimeout(()=>reject(new Error(`${aiType} timeout after ${specialist.timeout}ms`)), specialist.timeout))
  ]);

  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  const data = await response.json();
  const content = data?.choices?.?.message?.content || "GPS-enhanced specialist analysis completed";
  return {
    aiType,
    result: {
      response: content,
      weight: specialist.weight,
      role: specialist.role,
      responseTime: Date.now() - aiStart,
      status: 'success',
      reasoningLevel: specialist.reasoningLevel,
      enhanced: true,
      gpsEnhanced: true
    }
  };
} catch (e) {
  return {
    aiType,
    result: {
      response: `${specialist.role}: location-aware fallback guidance.`,
      weight: specialist.weight,
      role: specialist.role,
      responseTime: Date.now() - aiStart,
      status: 'fallback',
      reasoningLevel: specialist.reasoningLevel,
      enhanced: true,
      gpsEnhanced: true,
      error: e.message
    }
  };
}
});

const results = await Promise.all(consultationPromises);
results.filter(Boolean).forEach(({ aiType, result }) => { consultationResults[aiType] = result; });

// Confidence-weighted fusion of specialist outputs (domain = 'general' by default)
function fuseSpecialistResults(domain, cons) {
const outs = Object.entries(cons)
.filter(([k,v]) => k !== 'judgeSynthesis' && v && v.response)
.map(([k,v]) => ({ specialist: k, text: v.response, baseWeight: v.weight || 1 }));
const fused = fusionWeights.fuse(domain, outs);
return {
fusedText: fused.map(f => ${f.specialist.toUpperCase()} (w=${f.weight.toFixed(2)}):\n${f.text}).join('\n\n---\n\n'),
fusedMeta: fused
};
}

const { fusedText, fusedMeta } = fuseSpecialistResults('general', consultationResults);

const locationContext = userLocation?.coordinates ? `
USER GPS LOCATION CONTEXT:

Coordinates: ${userLocation.coordinates.lat}, ${userLocation.coordinates.lng}

Location Type: ${userLocation.locationType}

Source: ${userLocation.locationSource}

Confidence: ${userLocation.confidence}

Within WV: ${userLocation.withinWV}
${userLocation.locationName ? - Name: ${userLocation.locationName} : ''}
${userLocation.nearbyLocations ? - Nearby: ${userLocation.nearbyLocations.slice(0, 3).map(l => ${l.name} (${l.distance}mi)).join(', ')} : ''}` : 'USER GPS LOCATION: Not available - using WV center fallback';

const judgePrompt = `
${JUDGE_AI.prompt}

${locationContext}

USER QUERY: "${message}"

SPECIALIST INPUTS (FUSED, CONFIDENCE-WEIGHTED):
${fusedText}

CRITICAL: Synthesize into ONE geographically precise response strategy. Respect fused weighting (strongest insights first).`.trim();

try {
const judgeResponse = await Promise.race([
fetch(OLLAMA_URL, {
method: "POST",
headers: { "Content-Type": "application/json", "Authorization": Bearer ${API_KEY} },
body: JSON.stringify({ model: OLLAMA_MODEL, messages: [{ role: "user", content: judgePrompt }], temperature: 0.3, max_tokens: 1024 })
}),
new Promise((_, reject)=>setTimeout(()=>reject(new Error('GPS-enhanced Judge timeout')), 30000))
]);

text
if (judgeResponse.ok) {
  const judgeData = await judgeResponse.json();
  consultationResults.judgeSynthesis = {
    response: judgeData?.choices?.?.message?.content || "GPS-enhanced synthesis completed",
    role: "GPS-Enhanced Judge AI",
    status: 'success',
    responseTime: Date.now() - consultationStartTime,
    gpsEnhanced: true,
    fusedMeta
  };
} else {
  consultationResults.judgeSynthesis = {
    response: `PRIMARY_FOCUS: Location-specific guidance\nKEY_MESSAGE_1: Address user's question with geographic precision\nKEY_MESSAGE_2: Use local resources\nDELIVERY_STYLE: Local, precise\nAVOID: Generic advice`,
    role: "GPS-Enhanced Judge AI",
    status: 'fallback',
    responseTime: Date.now() - consultationStartTime,
    gpsEnhanced: true,
    fusedMeta
  };
}

responseCache.set(cacheKey, { timestamp: Date.now(), data: consultationResults });
return consultationResults;
} catch {
consultationResults.judgeSynthesis = {
response: PRIMARY_FOCUS: Location-specific guidance\nKEY_MESSAGE_1: Address user's question with geographic precision\nKEY_MESSAGE_2: Use local resources\nDELIVERY_STYLE: Local, precise\nAVOID: Generic advice,
role: "GPS-Enhanced Judge AI",
status: 'fallback',
responseTime: Date.now() - consultationStartTime,
gpsEnhanced: true
};
responseCache.set(cacheKey, { timestamp: Date.now(), data: consultationResults });
return consultationResults;
}
}

// -------------------- Main Converse --------------------
exports.converse = async function(message, userId, requestMetadata = {}) {
const startTime = Date.now();
if (!message || String(message).length < 1) {
return { reply: "I'm here to help, darlin'. What can I do for you?", agent: "Ms. Jarvis", time: Date.now(), consultation: { specialists: [], confidence: "high", processingMode: "input_validation", processingTime: Date.now()-startTime } };
}

try {
const userLocation = await gpsLocationService.determineUserLocation(message, requestMetadata);
if (userLocation?.coordinates) {
userLocation.nearbyLocations = await gpsLocationService.getNearbyLocations(userLocation.coordinates.lat, userLocation.coordinates.lng, 25);
}

text
const docContext = prepareGPSEnhancedDocumentContext(message, userLocation);

const relevantMemories = gpsEnhancedMemory.retrieveLocationRelevantMemories(userId, message, userLocation, 3);
const memoryContext = relevantMemories.map(m=>`Prev: "${m.message}" -> "${(m.response||'').slice(0,160)}..." ${m.location?`(Loc: ${m.location.coordinates.lat}, ${m.location.coordinates.lng})`:''}`).join('\n');
const memoryStats = gpsEnhancedMemory.getMemoryStats(userId);

const msgLower = String(message).toLowerCase();
let reasoningCategory = null;
for (const [cat, data] of Object.entries(REASONING_CATEGORIES)) {
  if (data.keywords.some(k=>msgLower.includes(k))) { reasoningCategory = data; break; }
}
if (!reasoningCategory) reasoningCategory = { routing:['creative','financial','spiritual','technical'], reasoningMode: REASONING_MODES.MULTI_PERSPECTIVE, reasoningDepth: REASONING_DEPTH_LEVELS.ADVANCED, requiresLocation: true };

const consultationResults = await gpsEnhancedConsultationWithJudgeSynthesis(message, docContext, reasoningCategory, memoryContext, userLocation);
const judgeSynth = consultationResults.judgeSynthesis?.response || "";

const finalPrompt = `
You are Ms. Jarvis, providing authentic, helpful responses with 100% accuracy based on the user's GPS coordinates.

USER QUERY: "${message}"

${userLocation?.coordinates ? USER GPS LOCATION: ${userLocation.coordinates.lat}, ${userLocation.coordinates.lng} (${userLocation.locationType}, confidence: ${userLocation.confidence}) : 'USER GPS LOCATION: Not available'}

GPS-ENHANCED JUDGE SYNTHESIS:
${judgeSynth}

INSTRUCTIONS:

Be precise to the user's coordinates

Reference local landmarks/resources

200-400 words, focused, location-specific`.trim();

const finalResp = await Promise.race([
fetch(OLLAMA_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':Bearer ${API_KEY}},body:JSON.stringify({model: OLLAMA_MODEL, messages:[{role:'user', content: finalPrompt}], temperature:0.8, max_tokens:2048})}),
new Promise((_,rej)=>setTimeout(()=>rej(new Error('Final response timeout')),45000))
]);
if (!finalResp.ok) throw new Error(Final response HTTP ${finalResp.status});
const finalData = await finalResp.json();
let reply = finalData?.choices?.?.message?.content || "I'm here for you, honey—ready with location-specific guidance.";

try { if (appalachianIntelligence.isInitialized) reply = appalachianIntelligence.applyCulturalContext(message, 'general', reply); } catch {}
try { if (aapcappeIntegration.isLoaded) reply = aapcappeIntegration.enhanceResponse(reply, message); } catch {}
try { if (geographicIntelligence.isInitialized) reply = geographicIntelligence.enhanceResponseWithGeography(reply, message); } catch {}
try { if (statewideWVIntelligence.isInitialized) { reply = statewideWVIntelligence.enhanceResponseWithStatewideContext(reply, message, userId); reply = statewideWVIntelligence.enhanceWithGeodeticData(reply, message, userId); } } catch {}

// Dynamic Clio search based on GPS and keywords
let clioIntegrationActive = false;
if (clioLiveSearch?.isInitialized) {
if (['historical','stories','history','heritage','clio','coal','mining','sites'].some(k=>msgLower.includes(k))) {
clioIntegrationActive = true;
try {
const searchCoordinates = userLocation?.coordinates || GPS_CONFIG.fallbackLocation;
const clioRes = await clioLiveSearch.searchForHistoricalContent(
message,
['historical sites','coal mining history','appalachian heritage','west virginia history','local landmarks'],
searchCoordinates
);
if (clioRes?.searchResults?.length) {
const top = clioRes.searchResults.slice(0,3).map(e=>**${e.title}**\n${(e.description||'').slice(0,200)}...).join('\n\n');
const locInfo = clioRes.detectedLocation?.locationName || 'your area';
reply += \n\n**Historical discoveries near ${locInfo} (based on your GPS location):**\n\n${top}\n\n*Source: The Clio - Educational Historical Database*;
}
} catch (e) { console.log('⚠️ GPS Clio search error:', e.message); }
}
}

// Record fusion outcome as "success" (placeholder heuristic: judge present => true)
try {
const judgeOk = consultationResults.judgeSynthesis?.status === 'success';
Object.entries(consultationResults)
.filter(([k]) => k !== 'judgeSynthesis')
.forEach(([k]) => fusionWeights.record('general', k, !!judgeOk));
} catch {}

gpsEnhancedMemory.storeMemory(userId, message, reply, consultationResults, userLocation);

const result = {
reply: reply.trim(),
agent: "Ms. Jarvis",
time: Date.now(),
userLocation,
consultation: {
specialists: Object.keys(consultationResults).filter(k=>k!=='judgeSynthesis'),
confidence: "high",
processingMode: "gps_enhanced_precise_location_delivery",
processingTime: Date.now()-startTime,
judgeSynthesis: consultationResults.judgeSynthesis?.status === 'success',
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

// Communications server (guarded)
try {
const isValidCommsUrl =
COMMUNICATIONS_SERVER_URL &&
COMMUNICATIONS_SERVER_URL !== 'http://your-communications-server-url' &&
/^https?://[^/\s]+/i.test(COMMUNICATIONS_SERVER_URL);

text
if (isValidCommsUrl) {
  fetch(`${COMMUNICATIONS_SERVER_URL}/api/store-communication`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      userMessage: message,
      aiResponse: result.reply,
      userId,
      metadata: {
        processingTime: result.consultation.processingTime,
        specialists: result.consultation.specialists,
        confidence: result.consultation.confidence,
        clioIntegrationUsed: clioIntegrationActive,
        gpsLocationData: result.consultation.gpsLocationData
      }
    })
  }).catch(e=>console.log('⚠️ Communications storage error:', e.message));
} else {
  console.log('ℹ️ Communications server URL not set or placeholder; skipping external logging.');
}
} catch (e) { console.log('⚠️ Failed to send communications data:', e.message); }

return result;

} catch (error) {
const total = Date.now()-startTime;
const fallbackReply = "Sugar, I’m having a little trouble right now. If you can share your GPS or the town you’re asking about, I’ll tailor the answer right to your spot on the map.";
gpsEnhancedMemory.storeMemory(userId, message, fallbackReply, { fallback:true }, null);
try {
const isValidCommsUrl =
COMMUNICATIONS_SERVER_URL &&
COMMUNICATIONS_SERVER_URL !== 'http://your-communications-server-url' &&
/^https?://[^/\s]+/i.test(COMMUNICATIONS_SERVER_URL);

text
if (isValidCommsUrl) {
  fetch(`${COMMUNICATIONS_SERVER_URL}/api/store-communication`, {
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
}
} catch {}
return { reply: fallbackReply, agent: "Ms. Jarvis", time: Date.now(), consultation: { specialists: ["authentic_fallback"], confidence: "medium", processingMode: "fallback", processingTime: total, fallbackReason: error.message } };
}
};
