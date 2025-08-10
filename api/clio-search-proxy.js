"use strict";

// api/clio-search-proxy.js
// Minimal JSON-returning endpoint: forwards a command (query + optional lat,lng)
// to The Clio search page, extracts a few items, and returns them as JSON.

const fetch = require('node-fetch');
const { buildClioQuery, clioSearchUrl } = require('../backendlib/cultural-integration/clio-integration/clio-query');

function safeStripHtml(s) {
  return String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Very defensive minimal extraction (kept resilient to minor markup changes)
function extractEntries(html) {
  const out = [];
  if (typeof html !== 'string' || html.length < 200) return out;

  // Strategy:
  // - Split around anchor tags to find potential entry links that include "entry" in href.
  // - Extract anchor text as title.
  // - Extract the first paragraph following as a snippet.
  const parts = html.split('<a').slice(1);
  for (const part of parts) {
    if (!/href="[^"]*entry[^"]*"/i.test(part)) continue;

    // Extract title text between > and </a>
    const afterGt = part.split('>');
    if (afterGt.length < 2) continue;
    const titleAndRest = afterGt.slice(1).join('>');
    const title = safeStripHtml(titleAndRest.split('</a>') || '');
    if (!title || title.length < 4) continue;

    // Extract a nearby paragraph for snippet
    const afterLink = part.split('</a>').slice(1).join('</a>') || '';
    const pMatch = afterLink.match(/<p[^>]*>([\s\S]{20,600}?)<\/p>/i);
    const snippet = pMatch ? safeStripHtml(pMatch).slice(0, 240) : '';

    // De-dup by title
    if (!out.find(x => x.title === title)) out.push({ title, snippet });
    if (out.length >= 6) break;
  }
  return out;
}

module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'Method not allowed', allowed: ['POST', 'OPTIONS'] });
      return;
    }

    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    } catch {
      res.status(400).json({ ok: false, error: 'Invalid JSON body' });
      return;
    }

    const message = String(body.query || body.message || '').trim();
    const lat = body.lat != null ? Number(body.lat) : null;
    const lng = body.lng != null ? Number(body.lng) : null;
    const locationHint = body.locationHint ? String(body.locationHint).trim() : null;

    const coords = (lat != null && lng != null && isFinite(lat) && isFinite(lng))
      ? { lat, lng }
      : null;

    const q = buildClioQuery(message, coords, locationHint);
    if (!q) {
      res.status(400).json({ ok: false, error: 'query is required' });
      return;
    }

    const url = clioSearchUrl(q);
    const r = await fetch(url, { timeout: 10000 });
    if (!r.ok) {
      res.status(502).json({ ok: false, error: `Clio upstream HTTP ${r.status}` });
      return;
    }
    const html = await r.text();
    const items = extractEntries(html);

    res.status(200).json({
      ok: true,
      query: q,
      source: 'theclio.com',
      url,
      count: items.length,
      items
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};
