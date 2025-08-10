// Simple CSV to GeoJSON converter for WV geodetic control points
const fs = require('fs');
const path = require('path');

// Adjust these file paths as needed:
const csvPath = path.join(__dirname, '../geodetic-intelligence/control_points.csv');
const geojsonPath = path.join(__dirname, '../geodetic-intelligence/control_points.geojson');

// Open and parse the CSV (assume comma delimited, including a header row)
const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split('\n').filter(Boolean);
const header = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());

// Find column indices
function findIndex(keywords) {
  for (let i = 0; i < header.length; i++) {
    if (keywords.some(kw => header[i].includes(kw))) return i;
  }
  return -1;
}
const idxName = findIndex(['name', 'station name']);
const idxLat = findIndex(['lat', 'latitude']);
const idxLon = findIndex(['lon', 'longitude']);
const idxElev = findIndex(['elev', 'elevation']);
const idxDatum = findIndex(['datum', 'vert datum', 'vdatum']);
const idxType = findIndex(['type', 'mark type', 'control_type']);
const idxAccuracy = findIndex(['acc', 'accuracy', 'mark order', 'order']);

if ([idxName, idxLat, idxLon].includes(-1)) {
  console.error("❌ CSV missing required columns (need at least name, latitude, longitude).");
  process.exit(1);
}

const features = lines.slice(1).map(line => {
  // Split line, handle quoted commas
  let cols = [];
  let current = '', inQuotes = false;
  for (let c of line) {
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) {
      cols.push(current);
      current = '';
    } else current += c;
  }
  cols.push(current);

  // Parse values (skip if incomplete)
  const name = (cols[idxName] || '').replace(/"/g, '').trim();
  const lat = parseFloat(cols[idxLat]);
  const lon = parseFloat(cols[idxLon]);
  const elev = idxElev !== -1 ? parseFloat(cols[idxElev]) : null;
  const datum = idxDatum !== -1 ? String(cols[idxDatum]).trim() : 'NAVD88';
  const type = idxType !== -1 ? String(cols[idxType]).trim() : 'control point';
  const accuracy = idxAccuracy !== -1 ? String(cols[idxAccuracy]).trim() : 'unknown';

  if (!name || isNaN(lat) || isNaN(lon)) return null;
  return {
    type: "Feature",
    properties: {
      name,
      elevation: elev,
      datum,
      control_type: type,
      accuracy
    },
    geometry: {
      type: "Point",
      coordinates: [lon, lat, elev]
    }
  };
}).filter(Boolean);

const geojson = { type: "FeatureCollection", features };
fs.writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2));
console.log(`✅ Converted CSV to GeoJSON: ${features.length} control points written to ${geojsonPath}`);
