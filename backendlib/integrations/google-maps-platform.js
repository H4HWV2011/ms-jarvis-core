"use strict";

// backendlib/integrations/google-maps-platform.js
const fetch = require('node-fetch');
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Base fetch function for any Google Maps API endpoint
async function fetchGoogle(endpoint, paramsObj) {
  const params = new URLSearchParams({ ...paramsObj, key: API_KEY });
  const url = `https://maps.googleapis.com/maps/api/${endpoint}?${params.toString()}`;
  const res = await fetch(url, { timeout: 15000 });
  if (!res.ok) throw new Error(`HTTP ${res.status} (${endpoint})`);
  return res.json();
}

module.exports = {
  // Places API (Nearby Search)
  async searchNearby({ lat, lng, keyword = '', radius = 15000, type = '' }) {
    const params = { location: `${lat},${lng}`, radius };
    if (keyword) params.keyword = keyword;
    if (type) params.type = type;
    return fetchGoogle('place/nearbysearch/json', params);
  },
  // Place Details
  async placeDetails(place_id) {
    return fetchGoogle('place/details/json', {
      place_id,
      fields: 'name,formatted_address,website,geometry,types,rating,opening_hours'
    });
  },
  // Geocoding
  async geocode(address) {
    return fetchGoogle('geocode/json', { address });
  },
  async reverseGeocode(lat, lng) {
    return fetchGoogle('geocode/json', { latlng: `${lat},${lng}` });
  },
  // Directions
  async directions(origin, destination) {
    return fetchGoogle('directions/json', { origin, destination });
  },
  // Weather/Air/Pollen APIs (if enabled in your Google Cloud project)
  async weather({ lat, lng }) {
    return fetchGoogle('weather/v1/weather', { location: `${lat},${lng}` });
  },
  async airQuality({ lat, lng }) {
    return fetchGoogle('airquality/v1/currentConditions:lookup', { location: `${lat},${lng}` });
  },
  async pollen({ lat, lng }) {
    return fetchGoogle('pollen/v1/lookup', { location: `${lat},${lng}` });
  },
  // You can add more Google APIs as needed here.
};
