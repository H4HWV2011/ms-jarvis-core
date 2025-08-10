#!/bin/bash
input_dir="$HOME/ms-jarvis-core/backendlib/geodetic-intelligence/shapefiles_batch"
output_dir="$HOME/ms-jarvis-core/backendlib/geodetic-intelligence"

mkdir -p "$output_dir"

for zipfile in "$input_dir"/*.zip; do
    tmpdir=$(mktemp -d)
    unzip -q "$zipfile" -d "$tmpdir"
    shpfile=$(find "$tmpdir" -name "*.shp" | head -n 1)
    if [[ -n "$shpfile" ]]; then
        base=$(basename "$shpfile" .shp)
        ogr2ogr -f GeoJSON "$output_dir/$base.geojson" "$shpfile"
        echo "Converted: $base.shp → $base.geojson"
    else
        echo "No .shp found in $zipfile"
    fi
    rm -rf "$tmpdir"
done
