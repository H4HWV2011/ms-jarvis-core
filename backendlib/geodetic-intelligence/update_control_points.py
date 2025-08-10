#!/usr/bin/env python3
from pathlib import Path
import json

geojson_dir = Path('/home/h4hwv/ms-jarvis-core/backendlib/geodetic-intelligence')
control_points_path = geojson_dir / 'control_points.geojson'

# Load existing control points
if control_points_path.exists():
    with open(control_points_path, 'r', encoding='utf-8') as f:
        try:
            control_points_data = json.load(f)
        except Exception:
            control_points_data = {"type": "FeatureCollection", "features": []}
else:
    control_points_data = {"type": "FeatureCollection", "features": []}

new_control_points = []
control_keywords = {"control", "benchmark", "survey", "marker", "monument"}

def get_field(props, keys):
    # Return the first non-empty value matching possible keys
    for key in keys:
        v = props.get(key)
        if v not in (None, '', ' '):
            return v
    return None

def flat_props(props):
    txt = []
    for k, v in props.items():
        try:
            txt.append(str(k).lower())
            if isinstance(v, (str, int, float)):
                txt.append(str(v).lower())
            elif isinstance(v, (list, tuple)):
                txt.extend([str(x).lower() for x in v])
            else:
                txt.append(str(v).lower())
        except Exception:
            continue
    return " ".join(txt)

def utm_to_latlon(easting, northing, zone=17, northern=True):
    try:
        import pyproj
        proj = pyproj.Proj(proj='utm', zone=zone, ellps='WGS84', south=not northern)
        lon, lat = proj(easting, northing, inverse=True)
        return [lon, lat]
    except:
        return None

for file in geojson_dir.glob('*.geojson'):
    if file.name == 'control_points.geojson':
        continue
    with open(file, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except Exception:
            print(f"Skipping {file.name} (invalid JSON)")
            continue
        for feature in data.get('features', []):
            geom = feature.get('geometry', {})
            if geom.get('type', '').lower() == 'point':
                props = feature.get('properties', {})

                # Check for control keywords
                checkstr = flat_props(props)
                if not any(kw in checkstr for kw in control_keywords):
                    continue

                # Extract name and elevation smartly
                name = get_field(props, ['name', 'NAME', 'FEATURE_NA', 'FEATURE_ID', 'PID'])
                elevation = get_field(props, ['elevation', 'ELEVATION', 'ELEV_IN_M', 'ELEV_IN_FT'])
                control_type = get_field(props, ['control_type', 'TYPE', 'FEATURE_TY'])
                datum = get_field(props, ['datum', 'ELEV_DATUM', 'DATUM_TAG', 'POS_DATUM'])

                coords = geom.get("coordinates", [])
                # If projected (meters), convert to lon/lat only if needed
                if isinstance(coords, list) and len(coords) >= 2:
                    if abs(coords[0]) > 180 or abs(coords[1]) > 90:
                        # Try converting (assumes UTM Zone 17 North; adjust as needed)
                        conv = utm_to_latlon(coords[0], coords[1])
                        if conv:
                            coords[0], coords[1] = conv

                feat = {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": coords},
                    "properties": {
                        "name": name,
                        "elevation": elevation,
                        "datum": datum,
                        "control_type": control_type,
                    }
                }
                new_control_points.append(feat)

def uniq_features(feats):
    seen = set()
    result = []
    for feat in feats:
        coords = tuple(feat.get("geometry", {}).get("coordinates", []))
        props = tuple(sorted((k, str(v)) for k, v in feat.get("properties", {}).items()))
        frozen = (coords, props)
        if frozen not in seen:
            seen.add(frozen)
            result.append(feat)
    return result

merged_points = uniq_features(control_points_data['features'] + new_control_points)
control_points_data['features'] = merged_points

with open(control_points_path, 'w', encoding='utf-8') as f:
    json.dump(control_points_data, f, indent=2)

print(f"✅ {len(new_control_points)} new control points scanned.")
print(f"🟢 Now {len(merged_points)} unique control points in {control_points_path.name}.")
