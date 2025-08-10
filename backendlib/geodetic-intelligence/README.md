# Geodetic Intelligence

This folder contains:
- `control_points.geojson` — Survey control points (GeoJSON standard)
    - properties expected: name, elevation, datum, accuracy, control_type
    - geometry: Point [lon, lat, elev]
- Classes/services to query and cache control point data for use by `brain.js`.
- Example loader: `../scripts/import_geodetic.js`
