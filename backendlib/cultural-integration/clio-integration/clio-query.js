"use strict";

// backendlib/cultural-integration/clio-integration/clio-query.js
// Compose a Clio-friendly query from user message and optional GPS/location hint

function buildClioQuery(message, coords, locationHint) {
  const parts = [];
  const msg = String(message || '').trim();
  if (msg) parts.push(msg);
  if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
    // Use backticks for the template literal!
    parts.push(`${coords.lat},${coords.lng}`);
  } else if (locationHint) {
    parts.push(String(locationHint).trim());
  }
  return parts.join(' ').trim();
}

function clioSearchUrl(q) {
  const params = new URLSearchParams({ q: q || '' });
  // Properly return a string URL (use backticks for template string)
  return `https://www.theclio.com/#!/search?${params.toString()}`;
}

module.exports = { buildClioQuery, clioSearchUrl };
