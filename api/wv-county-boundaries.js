// ~/ms-jarvis-core/api/wv-county-boundaries.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    // WV GIS Tech Center: All WV county boundaries, GeoJSON output
    const url = "https://services.wvgis.wvu.edu/ArcGIS/rest/services/Boundaries/wv_political_boundary/MapServer/0/query?where=1=1&outFields=*&f=geojson";
    const response = await fetch(url);

    if (!response.ok) throw new Error("Failed to fetch WV county boundaries.");

    const geojson = await response.json();
    // GeoJSON output is already MapServer standard; you can serve as-is
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(geojson);
  } catch (error) {
    // Reliable fallback: rectangle for Mount Hope and Fayette County
    const fallback = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [-81.4833, 38.2667],
              [-80.7833, 38.2667],
              [-80.7833, 37.7833],
              [-81.4833, 37.7833],
              [-81.4833, 38.2667]
            ]]
          },
          properties: {
            name: "Fayette County (Fallback)",
            county_seat: "Fayetteville",
            region: "Central Mountains"
          }
        }
      ]
    };
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(fallback);
  }
};
