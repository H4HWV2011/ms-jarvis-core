#!/usr/bin/env python3
import json
from pathlib import Path
import pyproj

path = Path("control_points.geojson")
data = json.loads(path.read_text(encoding="utf-8"))

# Projected system - adjust zone as needed
utm17n = pyproj.Proj(proj="utm", zone=17, ellps="WGS84", south=False)
updated = 0

for feat in data["features"]:
    coords = feat["geometry"]["coordinates"]
    if abs(coords[0]) > 180 or abs(coords[1]) > 90:  # projected coords
        lon, lat = utm17n(coords[0], coords[1], inverse=True)
        # Preserve Z if present
        if len(coords) == 3:
            feat["geometry"]["coordinates"] = [lon, lat, coords[2]]
        else:
            feat["geometry"]["coordinates"] = [lon, lat]
        updated += 1

path.write_text(json.dumps(data, indent=2), encoding="utf-8")
print(f"✅ Converted {updated} projected points to WGS84 lon/lat")
