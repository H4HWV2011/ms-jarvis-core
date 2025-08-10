// gpsLocationService.js — live WV place & geodetic lookup for MsJarvis

const fs = require('fs');
const path = require('path');

// UPDATE THIS if your geodetic data file is named differently or lives elsewhere:
const GEO_FILE = path.join(__dirname, '../data/geodetic-control-points.geojson');

let locationData = [];
try {
  const geojson = JSON.parse(fs.readFileSync(GEO_FILE, 'utf8'));
  locationData = geojson.features.map(f => ({
    name: (f.properties.name || '').trim(),
    county: (f.properties.county || f.properties.County || '').trim(),
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
    elevation: f.properties.elevation || f.properties.Elevation || null
  }));
  console.log(`[gpsLocationService] Loaded ${locationData.length} locations from ${GEO_FILE}`);
} catch (err) {
  console.error("Could not load geodetic data:", err.message);
  locationData = [];
}

// Simple helper: fuzzy match town/place in input message
function findPlace(message) {
  const cleanedMsg = message.toLowerCase()
    .replace(/,/g, '')          // remove commas
    .replace(/\bwest virginia\b/gi, '') // remove "west virginia"
    .replace(/\bwva\b/gi, '')   // remove WVA abbreviation
    .replace(/\bw\.?v\.?\b/gi, '') // remove W.V. or WV
    .trim();

  return (
    locationData.find(loc =>
      loc.name &&
      cleanedMsg.includes(loc.name.toLowerCase())
    ) || null
  );
}
module.exports = {
  determineUserLocation: async (message) => {
    const match = findPlace(message);
    if (!match) {
      // Optionally: fallback by trying county names
      const byCounty = locationData.find(loc => loc.county && message.toLowerCase().includes(loc.county.toLowerCase()));
      if (byCounty) {
        return {
          coordinates: { lat: byCounty.lat, lng: byCounty.lng },
          locationType: 'WV county (geodetic DB)',
          confidence: 0.7,
          county: byCounty.county,
          elevation: byCounty.elevation,
          name: byCounty.name,
          locationSource: 'geodetic-control-points'
        };
      }
      // No match found
      return null;
    }
    return {
      coordinates: { lat: match.lat, lng: match.lng },
      locationType: 'WV place (geodetic DB)',
      confidence: 0.95,
      county: match.county,
      elevation: match.elevation,
      name: match.name,
      locationSource: 'geodetic-control-points'
    };
  },

  getNearbyLocations: async (lat, lng, radiusMiles = 25) => {
    function haversine(lat1, lon1, lat2, lon2) {
      const toRad = x => x * Math.PI / 180;
      const R = 3959; // miles
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
    return locationData
      .filter(
        t =>
          Math.abs(lat - t.lat) < 1 &&
          Math.abs(lng - t.lng) < 1 &&
          haversine(lat, lng, t.lat, t.lng) <= radiusMiles
      )
      .map(t => ({
        name: t.name,
        county: t.county,
        lat: t.lat,
        lng: t.lng
      }));
  }
};
