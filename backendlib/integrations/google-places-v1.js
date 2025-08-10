"use strict";
/**
backendlib/integrations/google-places-v1.js
Minimal HTTPS helper for Places API (New) v1: searchNearby and searchText.
Uses X-Goog-FieldMask per v1 requirements.
*/
const https = require("https");

function doRequest({ hostname, path, method = "POST", headers = {}, body = {} }) {
  const payload = JSON.stringify(body ?? {});
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname,
        path,
        method,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...headers,
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const json = data ? JSON.parse(data) : {};
            resolve({ status: res.statusCode, json });
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function fieldMaskCommon() {
  return [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.primaryType",
    "places.types",
    "places.rating",
    "places.userRatingCount",
  ].join(",");
}

async function searchNearby({
  apiKey,
  center,
  radiusMeters,
  includedTypes = [],
  maxResultCount = 20,
  rankPreference = "RELEVANCE",
}) {
  const body = {
    includedTypes,
    maxResultCount: Math.min(Math.max(maxResultCount || 20, 1), 20),
    rankPreference,
    locationRestriction: {
      circle: {
        center: { latitude: Number(center.lat), longitude: Number(center.lng) },
        radius: Number(radiusMeters),
      },
    },
  };

  const { status, json } = await doRequest({
    hostname: "places.googleapis.com",
    path: "/v1/places:searchNearby",
    method: "POST",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fieldMaskCommon(),
    },
    body,
  });

  if (status >= 400) throw new Error(`NearbySearch failed ${status}: ${JSON.stringify(json)}`);
  return Array.isArray(json.places) ? json.places : [];
}

async function searchText({
  apiKey,
  textQuery,
  center,
  radiusMeters,
  maxResultCount = 20,
}) {
  const body = {
    textQuery,
    maxResultCount: Math.min(Math.max(maxResultCount || 20, 1), 20),
    locationBias: {
      circle: {
        center: { latitude: Number(center.lat), longitude: Number(center.lng) },
        radius: Number(radiusMeters),
      },
    },
  };

  const { status, json } = await doRequest({
    hostname: "places.googleapis.com",
    path: "/v1/places:searchText",
    method: "POST",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fieldMaskCommon(),
    },
    body,
  });

  if (status >= 400) throw new Error(`TextSearch failed ${status}: ${JSON.stringify(json)}`);
  return Array.isArray(json.places) ? json.places : [];
}

module.exports = { searchNearby, searchText };
