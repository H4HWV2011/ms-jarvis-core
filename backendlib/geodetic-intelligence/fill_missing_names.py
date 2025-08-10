#!/usr/bin/env python3
import json
from pathlib import Path

path = Path("control_points.geojson")
data = json.loads(path.read_text(encoding="utf-8"))

# Fields we will use to fill missing `name`
fill_fields = ["NAME", "FEATURE_NA", "PID", "MAP_NAME", "QUAD"]

updated = 0
for feat in data.get("features", []):
    # If lowercase 'name' is missing or empty
    if not feat["properties"].get("name"):
        for field in fill_fields:
            val = feat["properties"].get(field)
            if val and str(val).strip():
                feat["properties"]["name"] = val
                updated += 1
                break

# Save back to file with pretty formatting
path.write_text(json.dumps(data, indent=2), encoding="utf-8")

print(f"✅ Filled {updated} missing 'name' values from alternate fields")
