"use strict";
/**
api/ai-locations.js
Places API (New) v1 Nearby Search with broad includedTypes + Text Search fallback.
Wide radius for coverage; supports GPS or city/county string.
Robust guards + logging to prevent FUNCTION_INVOCATION_FAILED.
*/
const { searchNearby, searchText } = require("../backendlib/integrations/google-places-v1");

// Use GOOGLE_MAPS as your environment variable.
const API_KEY = process.env.GOOGLE_MAPS;

const WV_CENTER = { lat: 38.5976, lng: -80.4549 };

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

function parseParams(req) {
  let body = {};
  if (req.method === "POST") body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});
  if (req.method === "GET") body = req.query || {};

  const lat = body.lat !== undefined ? Number(body.lat) : undefined;
  const lng = body.lng !== undefined ? Number(body.lng) : undefined;
  const location = typeof body.location === "string" ? body.location.trim() : "";
  // Clamp radius to Google max of 50,000 meters (not 200,000)
  const radiusRaw = body.radius ?? body.radiusMeters ?? 150000;
  const radius = Math.max(1000, Math.min(Number(radiusRaw) || 50000, 50000)); // enforce <=50km
  return { lat, lng, location, radius };
}

function mapPlacesToItems(places) {
  if (!Array.isArray(places)) return [];
  return places
    .map((p) => {
      const loc = p.location;
      const pos = loc ? { lat: Number(loc.latitude), lng: Number(loc.longitude) } : null;
      return {
        title: p.displayName?.text || "",
        address: p.formattedAddress || "",
        position: pos,
        primaryType: p.primaryType || "",
        types: Array.isArray(p.types) ? p.types : [],
        rating: p.rating,
        userRatingCount: p.userRatingCount,
      };
    })
    .filter((x) => x.title && x.position);
}

function dedupe(items, limit = 80) {
  const out = [];
  const seen = new Set();
  for (const it of items) {
    const key = `${it.title}|${it.address}|${it.position?.lat}|${it.position?.lng}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(it);
      if (out.length >= limit) break;
    }
  }
  return out;
}

// Geocode center via Text Search v1 with guards
async function geocodeCenter({ address, fallback }) {
  try {
    const candidates = await searchText({
      apiKey: API_KEY,
      textQuery: address,
      center: fallback,
      radiusMeters: 50000, // Google maximum
      maxResultCount: 1,
    });
    if (Array.isArray(candidates) && candidates.length > 0) {
      const loc = candidates?.location;
      if (loc && Number.isFinite(loc.latitude) && Number.isFinite(loc.longitude)) {
        return { lat: Number(loc.latitude), lng: Number(loc.longitude) };
      }
    }
  } catch (e) {
    console.error("geocodeCenter error:", e?.message || e);
  }
  return fallback;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!API_KEY) {
    // Fail fast with clear message if env var is missing
    return res.status(500).json({ ok: false, error: "Missing GOOGLE_MAPS env var" });
  }

  const { lat, lng, location, radius } = parseParams(req);

  // Determine center
  let center = WV_CENTER;
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    center = { lat, lng };
  } else if (location && location.length > 3) {
    center = await geocodeCenter({ address: location, fallback: WV_CENTER });
  }

  try {
    // Broad includedTypes to maximize recall
    const includedTypesSets = [
      ["point_of_interest", "tourist_attraction", "museum", "park"],
      ["store", "shopping_mall", "supermarket"],
      ["restaurant", "cafe", "bar"],
      ["bank", "pharmacy", "hospital", "library", "school", "university", "church", "lodging"],
    ];

    let aggregated = [];

    // Multiple Nearby searches
    for (const includedTypes of includedTypesSets) {
      try {
        const places = await searchNearby({
          apiKey: API_KEY,
          center,
          radiusMeters: radius,
          includedTypes,
          maxResultCount: 20,
          rankPreference: "DISTANCE", // Only valid value for v1
        });
        aggregated = aggregated.concat(mapPlacesToItems(places));
      } catch (e) {
        console.error("searchNearby error:", e?.message || e);
      }
    }

    // Text Search fallback if empty
    if (aggregated.length === 0) {
      const textQueries = [
        "restaurants near me",
        "parks near me",
        "museums near me",
        "shopping near me",
        "tourist attractions near me",
      ];
      for (const q of textQueries) {
        try {
          const places = await searchText({
            apiKey: API_KEY,
            textQuery: q,
            center,
            radiusMeters: radius, // always <= 50000
            maxResultCount: 20,
          });
          aggregated = aggregated.concat(mapPlacesToItems(places));
          if (aggregated.length >= 20) break;
        } catch (e) {
          console.error("searchText error:", e?.message || e);
        }
      }
    }

    const unique = dedupe(aggregated, 80);
    return res.status(200).json({ ok: true, count: unique.length, items: unique, center, radius });
  } catch (e) {
    console.error("ai-locations fatal:", e?.message || e);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
};
