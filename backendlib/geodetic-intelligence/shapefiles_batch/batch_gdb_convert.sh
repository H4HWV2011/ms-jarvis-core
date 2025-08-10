#!/bin/bash
for zipf in *.gdb.zip; do
  # Extract ZIP to temp folder
  tmpdir=$(mktemp -d)
  unzip -q "$zipf" -d "$tmpdir"
  # Find the first .gdb folder just extracted
  gdbdir=$(find "$tmpdir" -type d -name "*.gdb" | head -n 1)
  if [[ -z "$gdbdir" ]]; then
    echo "No .gdb found in $zipf"
    rm -rf "$tmpdir"
    continue
  fi
  # List layers present in the .gdb
  layers=$(ogrinfo "$gdbdir" | grep '^Layer:' | awk '{print $2}')
  # Convert each layer to its own GeoJSON
  for lyr in $layers; do
    ogr2ogr -f GeoJSON "../${lyr}.geojson" "$gdbdir" "$lyr"
    echo "Converted: $lyr → ../${lyr}.geojson"
  done
  rm -rf "$tmpdir"
done
