// Simple geodetic control point loader/validator
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../geodetic-intelligence/control_points.geojson');

fs.readFile(inputFile, 'utf8', (err, data) => {
  if (err) { console.error('Error reading input:', err); process.exit(1); }
  const geojson = JSON.parse(data);
  if (geojson.type !== 'FeatureCollection') {
    console.error('File is not a GeoJSON FeatureCollection!');
    process.exit(1);
  }
  let count = 0;
  geojson.features.forEach((f, i) => {
    if (!f.properties.name || !f.geometry) {
      console.log(`[INVALID] at feature #${i}`);
    } else {
      count++;
    }
  });
  console.log(`Validation complete. Loaded ${count}/${geojson.features.length} control points.`);
});
