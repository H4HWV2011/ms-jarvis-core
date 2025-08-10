// backendlib/cultural-integration/clio-integration/clio-live-search.js
// Dynamic Location-Aware Clio Platform Search Integration for WV GPS and explicit-location queries
// FIXED: ES Module dynamic import for node-fetch compatibility

const cheerio = require('cheerio');

class ClioLiveSearch {
  constructor() {
    this.baseUrl = 'https://www.theclio.com';
    this.userAgent = 'Mozilla/5.0 (Educational/Community Use - Ms. Jarvis WV Historical AI System)';
    this.rateLimit = 2000; // 2s polite delay
    this.cache = new Map();
    this.cacheExpiry = 3600000; // 1 hour
    this.maxRetries = 3;
    this.isInitialized = false;

    // WV statewide known locations (cities and counties) for text detection and proximity filtering
    this.locationDatabase = {
      counties: new Map([
        ['fayette', { lat: 38.0348, lng: -81.1065, region: 'South Central WV' }],
        ['raleigh', { lat: 37.7687, lng: -81.2209, region: 'Southern WV' }],
        ['boone', { lat: 37.9315, lng: -81.8190, region: 'Southern WV' }],
        ['logan', { lat: 37.8423, lng: -82.0140, region: 'Southern WV' }],
        ['mingo', { lat: 37.7509, lng: -82.2998, region: 'Southern WV' }],
        ['mcdowell', { lat: 37.2787, lng: -81.6309, region: 'Southern WV' }],
        ['mercer', { lat: 37.3659, lng: -81.0998, region: 'Southern WV' }],
        ['kanawha', { lat: 38.3498, lng: -81.6326, region: 'Central WV' }],
        ['greenbrier', { lat: 37.9015, lng: -80.3287, region: 'Southeastern WV' }],
        ['nicholas', { lat: 38.2487, lng: -80.8709, region: 'South Central WV' }],
        ['monongalia', { lat: 39.6487, lng: -79.9742, region: 'North Central WV' }],
        ['berkeley', { lat: 39.4523, lng: -77.9636, region: 'Eastern Panhandle' }],
        ['jefferson', { lat: 39.3087, lng: -77.8542, region: 'Eastern Panhandle' }],
        ['ohio', { lat: 40.0709, lng: -80.6609, region: 'Northern Panhandle' }],
        ['wood', { lat: 39.2787, lng: -81.6309, region: 'Northwestern WV' }]
      ]),
      cities: new Map([
        ['charleston', { lat: 38.3498, lng: -81.6326, county: 'Kanawha' }],
        ['huntington', { lat: 38.4192, lng: -82.2744, county: 'Cabell' }],
        ['morgantown', { lat: 39.6487, lng: -79.9742, county: 'Monongalia' }],
        ['wheeling', { lat: 40.0709, lng: -80.6609, county: 'Ohio' }],
        ['martinsburg', { lat: 39.4523, lng: -77.9636, county: 'Berkeley' }],
        ['beckley', { lat: 37.7782, lng: -81.1887, county: 'Raleigh' }],
        ['lewisburg', { lat: 37.8015, lng: -80.4487, county: 'Greenbrier' }],
        ['parkersburg', { lat: 39.2787, lng: -81.6309, county: 'Wood' }],
        ['fayetteville', { lat: 38.0548, lng: -81.1065, county: 'Fayette' }],
        ['bluefield', { lat: 37.2698, lng: -81.2223, county: 'Mercer' }]
      ]),
      sites: new Map([
        ['new river gorge', { lat: 37.9784, lng: -81.0709, region: 'Fayette' }],
        ['harpers ferry', { lat: 39.3254, lng: -77.7342, region: 'Jefferson' }],
        ['coal heritage', { lat: 37.8500, lng: -81.2000, region: 'Southern WV' }]
      ])
    };
  }

  async initialize() {
    this.isInitialized = true;
    return true;
  }

  delay(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  getCacheKey(term, tag) {
    return `${term}__${tag}`.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
  }

  isValidCache(entry) {
    return entry && Date.now() - entry.timestamp < this.cacheExpiry;
  }

  // Detect a textual location reference from the user's message, without forcing Mount Hope
  detectLocationFromQuery(message) {
    const m = (message || '').toLowerCase();

    // Coordinates in text using regex pattern for decimal numbers
    const coord = m.match(/([-]?\d{1,2}\.\d+)[,\s]+([-]?\d{1,3}\.\d+)/);
    if (coord) {
      const lat = parseFloat(coord[1]);
      const lng = parseFloat(coord[2]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return { coordinates: { lat, lng }, locationType: 'coordinates', locationName: `${lat}, ${lng}`, source: 'explicit_coordinates' };
      }
    }

    // City names
    for (const [name, data] of this.locationDatabase.cities.entries()) {
      if (m.includes(name)) {
        return { coordinates: { lat: data.lat, lng: data.lng }, locationType: 'city', locationName: name, source: 'explicit_city', county: data.county };
      }
    }

    // County references
    for (const [name, data] of this.locationDatabase.counties.entries()) {
      if (m.includes(`${name} county`) || m.includes(`in ${name}`)) {
        return { coordinates: { lat: data.lat, lng: data.lng }, locationType: 'county', locationName: `${name} county`, source: 'explicit_county', region: data.region };
      }
    }

    // Known sites
    for (const [name, data] of this.locationDatabase.sites.entries()) {
      if (m.includes(name)) {
        return { coordinates: { lat: data.lat, lng: data.lng }, locationType: 'site', locationName: name, source: 'explicit_site', region: data.region };
      }
    }

    return { coordinates: null, locationType: 'none', locationName: null, source: 'none' };
  }

  // FIXED: ES Module dynamic import for node-fetch
  async searchByKeywords(term, tag = 'general') {
    const key = this.getCacheKey(term, tag);
    const cached = this.cache.get(key);
    if (this.isValidCache(cached)) return cached.data;

    const url = `${this.baseUrl}/search?q=${encodeURIComponent(term)}`;
    try {
      // Dynamic import for ES Module compatibility
      const fetch = require('node-fetch');
      const resp = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 10000
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const html = await resp.text();
      const parsed = this.parseResults(html, term);
      this.cache.set(key, { data: parsed, timestamp: Date.now() });
      await this.delay(this.rateLimit);
      return parsed;
    } catch {
      return [];
    }
  }

  parseResults(html, term) {
    const $ = cheerio.load(html);
    const out = [];
    const selectors = ['.entry-item', '.search-result', '.result-item', 'article', '.card', 'li'];

    for (const sel of selectors) {
      $(sel).each((_, el) => {
        const title = $(el).find('h1,h2,h3,h4,.title,.heading').first().text().trim() || $(el).find('a').first().text().trim();
        const description = $(el).find('p,.description,.summary,.excerpt').first().text().trim();
        const link = $(el).find('a').first().attr('href');
        if (title && description && link) {
          out.push({
            title: title.replace(/\s+/g, ' ').slice(0, 200),
            description: description.replace(/\s+/g, ' ').slice(0, 1000),
            url: link.startsWith('http') ? link : `${this.baseUrl}${link}`,
            relevanceScore: this.score(term, `${title} ${description}`)
          });
        }
      });
      if (out.length) break;
    }

    return out.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 10);
  }

  score(term, text) {
    const t = term.toLowerCase().split(/\s+/).filter(Boolean);
    const x = (text || '').toLowerCase();
    return Math.min(1, t.reduce((acc, w) => acc + (x.includes(w) ? 0.2 : 0), 0));
  }

  async searchForHistoricalContent(userMessage, keywords = ['historical sites', 'coal mining history', 'appalachian heritage', 'west virginia history'], coords = null) {
    // detect textual location, but do not force it to Mount Hope
    const detected = this.detectLocationFromQuery(userMessage);
    const locationTag = coords ? `gps_${coords.lat}_${coords.lng}` :
                       detected.coordinates ? `det_${detected.locationName}` : 'unknown_location';

    const allTerms = [];
    if (coords) {
      // If GPS is available, bias terms to WV and region but do not inject a specific city
      allTerms.push('West Virginia history');
      allTerms.push('West Virginia coal history');
    }
    if (detected.locationName) {
      allTerms.push(`${detected.locationName} West Virginia history`);
      allTerms.push(`${detected.locationName} historical sites`);
    }
    allTerms.push(...keywords);

    const results = [];
    for (const term of allTerms) {
      const r = await this.searchByKeywords(term, locationTag);
      results.push(...r);
    }

    // De-duplicate on title+url
    const seen = new Set();
    const uniq = results.filter(r => {
      const k = `${r.title}__${r.url}`.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    return {
      detectedLocation: detected,
      searchResults: uniq.slice(0, 15),
      searchMetadata: {
        usedGPS: !!coords,
        coordinates: coords,
        detectedLocation: detected.locationName || null,
        terms: allTerms
      }
    };
  }
}

module.exports = { ClioLiveSearch };
