// gpsLocationService.js -- points at real geodetic data
const fs = require('fs');
const path = require('path');

// Point to your actual geodetic file:
const GEODETIC_FILE = path.join(__dirname, '../data/geodetic-control-points.geojson');

let locationData = [];
try {
  const geojson = JSON.parse(fs.readFileSync(GEODETIC_FILE, 'utf8'));
  locationData = geojson.features.map(f => ({
    name: f.properties.name,
    county: f.properties.county || null,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
    elevation: f.properties.elevation || null
  }));
} catch (err) {
  console.error("Could not load geodetic data:", err.message);
function findPlace(message) {
  const cleanedMsg = message
    .toLowerCase()
    .replace(/,/g, '')
    .replace(/\bwest virginia\b/gi, '')
    .replace(/\bwva\b/gi, '')
    .replace(/\bw\.?v\.?\b/gi, '')
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
    if (!match) return null;
    return {
      coordinates: { lat: match.lat, lng: match.lng },
      locationType: 'WV place (geodetic DB)',
      confidence: 0.9,
      county: match.county,
      elevation: match.elevation,
      name: match.name,
      locationSource: 'geodetic-control-points'
    };
  },
  getNearbyLocations: async (lat, lng, radiusMiles = 25) => {
  }
};
