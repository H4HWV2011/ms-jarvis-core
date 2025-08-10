// Fetch and convert NGS control points for West Virginia to GeoJSON
const https = require('https');
const fs = require('fs');
const path = require('path');

// Download URL for NGS DataExplorer (West Virginia, all marks, CSV format)
const downloadUrl = "https://geodesy.noaa.gov/api/nosdataexplorer/v1/marks?bbox=-82.65,37.2,-77.7,40.65&output=csv"; // WV bounding box

const outCSV = path.join(__dirname, '../geodetic-intelligence/ngs_wv_points.csv');
const outGeoJSON = path.join(__dirname, '../geodetic-intelligence/control_points.geojson');

function downloadFile(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    if (response.statusCode !== 200) {
      console.error("Failed to download file: " + response.statusCode)
      process.exit(1);
    }
    response.pipe(file);
    file.on('finish', () => {
      file.close(cb);
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    console.error("Error: " + err.message);
    process.exit(1);
  });
}

// Parse CSV and convert to GeoJSON
function csvToGeoJSON(csvPath, geojsonPath) {
  const csv = fs.readFileSync(csvPath, 'utf8');
  const lines = csv.split('\n').filter(Boolean);
  const header = lines[0].split(',');

  // Find column indices (robust to column order)
  const nameIdx = header.indexOf('Name');
  const elevIdx = header.findIndex(h => h.toLowerCase().includes('elevation'));
  const latIdx = header.findIndex(h => ['latitude'].some(k=>h.toLowerCase().includes(k)));
  const lonIdx = header.findIndex(h => ['longitude'].some(k=>h.toLowerCase().includes(k)));

  const features = lines.slice(1).map(line => {
    const cols = line.split(',');
    if (cols.length < 6) return null;
    const name = cols[nameIdx] || "";
    const elev = parseFloat(cols[elevIdx]);
    const lat = parseFloat(cols[latIdx]);
    const lon = parseFloat(cols[lonIdx]);
    if (!name || isNaN(lat) || isNaN(lon)) return null;
    return {
      type: "Feature",
      properties: {
        name: name.trim(),
        elevation: elev,
        datum: "NAVD88",
        accuracy: "surveyed",
        control_type: "NGS benchmark"
      },
      geometry: {
        type: "Point",
        coordinates: [lon, lat, elev]
      }
    };
  }).filter(Boolean);

  const geojson = { type: "FeatureCollection", features };
  fs.writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2));
  console.log(`✅ Imported ${features.length} NGS control points; written to ${geojsonPath}`);
}

// Run!
console.log("⏬ Downloading WV NGS control point data...");
downloadFile(downloadUrl, outCSV, () => {
  console.log("📥 Downloaded CSV. Converting to GeoJSON...");
  csvToGeoJSON(outCSV, outGeoJSON);
});
