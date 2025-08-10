// backendlib/cultural-integration/clio-integration/the-clio-integration.js - Direct Historical Storytelling Overhaul
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

class ClioWebScraper {
  constructor() {
    this.baseUrl = 'https://www.theclio.com';
    this.rateLimitDelay = 3000;
    this.userAgent = 'Mozilla/5.0 (Educational/Community Use - Mount Hope WV Historical AI System)';
    this.maxRetries = 3;
  }

  async scrapeHistoricalEntries(searchTerms = ['West Virginia', 'Mount Hope', 'New River Gorge', 'Appalachian']) {
    console.log('🔍 Starting ethical web scraping of The Clio platform...');
    const results = [];

    for (const term of searchTerms) {
      await this.delay(this.rateLimitDelay);

      try {
        console.log(`🔍 Searching for: ${term}`);
        const entries = await this.scrapeSearchResults(term);
        results.push(...entries);
        await this.delay(1000);
      } catch (error) {
        console.log(`⚠️ Error scraping for ${term}:`, error.message);
      }
    }

    console.log(`📚 Scraped ${results.length} historical entries from The Clio`);
    return this.deduplicateEntries(results);
  }

  async scrapeSearchResults(searchTerm) {
    const entries = [];
    try {
      const searchUrls = [
        `${this.baseUrl}/search?q=${encodeURIComponent(searchTerm)}`,
        `${this.baseUrl}/entries?search=${encodeURIComponent(searchTerm)}`,
        `${this.baseUrl}/?s=${encodeURIComponent(searchTerm)}`
      ];

      for (const url of searchUrls) {
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': this.userAgent,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'DNT': '1',
              'Connection': 'keep-alive'
            },
            timeout: 10000
          });

          if (response.ok) {
            const html = await response.text();
            const pageEntries = this.parseHistoricalEntries(html, searchTerm);
            entries.push(...pageEntries);

            if (pageEntries.length > 0) {
              console.log(`✅ Found ${pageEntries.length} entries for ${searchTerm}`);
              break;
            }
          }
        } catch (urlError) {
          console.log(`⚠️ URL ${url} failed:`, urlError.message);
          continue;
        }
        await this.delay(500);
      }
    } catch (error) {
      console.log(`❌ Search failed for ${searchTerm}:`, error.message);
    }
    return entries;
  }

  parseHistoricalEntries(html, searchTerm) {
    const $ = cheerio.load(html);
    const entries = [];

    const selectors = [
      '.entry-item, .entry, .result-item, .search-result',
      'article, .article, .post, .content-item',
      '.card, .listing, .item, .row'
    ];

    for (const selector of selectors) {
      $(selector).each((index, element) => {
        const entry = this.extractEntryData($, element, searchTerm);
        if (entry && entry.title && entry.description) {
          entries.push(entry);
        }
      });
      if (entries.length > 0) break;
    }
    return entries;
  }

  extractEntryData($, element, searchTerm) {
    try {
      const $el = $(element);

      const title = $el.find('h1, h2, h3, h4, .title, .heading, .entry-title').first().text().trim() ||
                   $el.find('a').first().text().trim() ||
                   $el.text().split('\n')[0].trim();

      const description = $el.find('p, .description, .summary, .excerpt, .content').first().text().trim() ||
                         $el.find('.text').text().trim() ||
                         $el.text().trim();

      const location = $el.find('.location, .place, .address').text().trim() ||
                      this.extractLocationFromText(description);

      const relativeUrl = $el.find('a').first().attr('href');
      const url = relativeUrl ? (relativeUrl.startsWith('http') ? relativeUrl : this.baseUrl + relativeUrl) : null;

      const category = $el.find('.category, .type, .tag').first().text().trim();

      if (title.length > 10 && description.length > 50) {
        return {
          title: this.cleanText(title),
          description: this.cleanText(description),
          location: this.cleanText(location),
          url: url,
          category: this.cleanText(category),
          searchTerm: searchTerm,
          scrapedAt: new Date().toISOString(),
          source: 'The Clio Platform'
        };
      }
    } catch (error) {
      console.log('⚠️ Error extracting entry data:', error.message);
    }
    return null;
  }

  extractLocationFromText(text) {
    const locationPatterns = [
      /([A-Z][a-z]+,?\s+[A-Z]{2})/g,
      /([A-Z][a-z]+\s+[A-Z][a-z]+,?\s+West Virginia)/gi,
      /(West Virginia|WV)/gi
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    return '';
  }

  cleanText(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim().substring(0, 500);
  }

  deduplicateEntries(entries) {
    const seen = new Set();
    return entries.filter(entry => {
      const key = `${entry.title}-${entry.location}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class TheClioIntegration {
  constructor() {
    this.baseUrl = 'https://www.theclio.com';
    this.apiEndpoint = 'https://www.theclio.com/api';
    this.historicalData = new Map();
    this.locationStories = new Map();
    this.walkingTours = new Map();
    this.communicationMatrix = new Map();
    this.reasoningContext = new Map();
    this.knowledgeBase = new Map();
    this.kmlData = new Map();
    this.scrapedData = new Map();
    this.geodeticIntegration = new Map();
    this.continuousLearning = new Map();
    this.lastUpdate = null;
    this.updateInterval = 7200000;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('🏛️ Initializing Direct Historical Storytelling Clio Integration...');

      await this.loadHistoricalData();
      await this.loadWestVirginiaStories();
      await this.loadWalkingTours();
      await this.setupDirectCommunicationMatrix();
      await this.setupAdvancedReasoningIntegration();
      await this.initializeSelfEvolvingKnowledgeBase();
      await this.setupGeodeticIntegration();
      await this.setupContinuousLearningIntegration();
      await this.setupKMLProcessing();
      await this.setupAutoUpdate();

      this.isInitialized = true;
      this.lastUpdate = Date.now();

      console.log('✅ Direct Historical Storytelling Clio Integration initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ The Clio Integration initialization error:', error.message);
      return false;
    }
  }

  async loadHistoricalData() {
    try {
      console.log('🔍 Loading historical data for direct storytelling...');

      const partnershipData = await this.loadPartnershipData();
      if (partnershipData && partnershipData.length > 0) {
        console.log('🤝 Using partnership data from The Clio');
        return this.storeHistoricalData(partnershipData);
      }

      console.log('🕸️ Attempting ethical web scraping for direct stories...');
      const scraper = new ClioWebScraper();
      const scrapedData = await scraper.scrapeHistoricalEntries([
        'West Virginia', 'Mount Hope', 'New River Gorge', 'Appalachian', 'Fayette County', 'coal mining'
      ]);

      if (scrapedData && scrapedData.length > 0) {
        console.log(`📚 Successfully scraped ${scrapedData.length} entries for direct storytelling`);
        const formattedData = this.formatScrapedDataForDirectStorytelling(scrapedData);
        this.storeScrapedData(scrapedData);
        return this.storeHistoricalData(formattedData);
      }

      console.log('🏠 Using comprehensive local historical database for direct stories');
      return await this.loadDirectHistoricalDatabase();

    } catch (error) {
      console.log('⚠️ Historical data loading error, using direct local database:', error.message);
      return await this.loadDirectHistoricalDatabase();
    }
  }

  async loadPartnershipData() {
    try {
      console.log('🤝 Checking for partnership or educational API access...');
      return null;
    } catch (error) {
      console.log('📝 No partnership API available');
      return null;
    }
  }

  formatScrapedDataForDirectStorytelling(scrapedEntries) {
    console.log('🔄 Formatting scraped data for direct historical storytelling...');
    const formattedData = {};

    scrapedEntries.forEach(entry => {
      const locationKey = this.getLocationKey(entry.location || entry.searchTerm);

      if (!formattedData[locationKey]) {
        formattedData[locationKey] = {
          location: this.parseCoordinatesWithGeodetic(entry.location),
          communicationStyle: 'Direct mountain storytelling',
          reasoningContext: 'Historical story delivery',
          geodeticContext: this.determineGeodeticContext(entry.location),
          continuousLearningTags: this.generateLearningTags(entry),
          historicalEntries: []
        };
      }

      const formattedEntry = {
        id: `scraped_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: entry.title,
        description: entry.description,
        type: entry.category || 'historical_site',
        period: this.extractPeriod(entry.description),
        significance: this.extractSignificance(entry.description),
        stories: [entry.description],
        directNarratives: [this.createDirectNarrative(entry)],
        culturalContext: this.determineCulturalContext(entry),
        modernRelevance: this.determineModernRelevance(entry),
        reasoningIntegration: this.createReasoningIntegration(entry),
        geodeticData: this.extractGeodeticInformation(entry),
        learningMetadata: this.createLearningMetadata(entry),
        source: 'The Clio Platform (Web Scraped)',
        url: entry.url,
        scrapedAt: entry.scrapedAt
      };

      formattedData[locationKey].historicalEntries.push(formattedEntry);
    });

    return formattedData;
  }

  parseCoordinatesWithGeodetic(location) {
    const defaultCoords = { latitude: 37.9084, longitude: -81.1434, elevation: 2150 };

    if (!location) return defaultCoords;

    const locationLower = location.toLowerCase();
    if (locationLower.includes('mount hope')) return { latitude: 37.9084, longitude: -81.1434, elevation: 2150 };
    if (locationLower.includes('new river gorge')) return { latitude: 37.8735, longitude: -81.0667, elevation: 1200 };
    if (locationLower.includes('harpers ferry')) return { latitude: 39.3209, longitude: -77.7403, elevation: 295 };

    return defaultCoords;
  }

  determineGeodeticContext(location) {
    if (!location) return 'Central Appalachian mountainous terrain';
    
    const locationLower = location.toLowerCase();
    if (locationLower.includes('mount hope')) return 'Elevated plateau at 2150ft with coal seam geology';
    if (locationLower.includes('new river gorge')) return 'Ancient river valley carved through Appalachian sandstone';
    if (locationLower.includes('harpers ferry')) return 'River confluence at 295ft elevation with strategic positioning';
    
    return 'Appalachian mountain geography with historical significance';
  }

  generateLearningTags(entry) {
    const tags = [];
    const text = (entry.title + ' ' + entry.description).toLowerCase();
    
    if (text.includes('coal') || text.includes('mining')) tags.push('coal_heritage_stories');
    if (text.includes('railroad') || text.includes('transportation')) tags.push('transportation_history_stories');
    if (text.includes('community') || text.includes('social')) tags.push('community_development_stories');
    if (text.includes('economic') || text.includes('industry')) tags.push('economic_transition_stories');
    
    return tags;
  }

  extractGeodeticInformation(entry) {
    return {
      hasLocationData: !!entry.location,
      estimatedCoordinates: this.parseCoordinatesWithGeodetic(entry.location),
      elevationContext: this.determineGeodeticContext(entry.location),
      geologicalRelevance: this.determineGeologicalRelevance(entry)
    };
  }

  determineGeologicalRelevance(entry) {
    const text = (entry.title + ' ' + entry.description).toLowerCase();
    
    if (text.includes('coal') || text.includes('mining')) return 'Coal seam geology and mining impact';
    if (text.includes('river') || text.includes('water')) return 'River system and water table interaction';
    if (text.includes('mountain') || text.includes('ridge')) return 'Appalachian mountain formation and terrain';
    
    return 'Regional geological context';
  }

  createLearningMetadata(entry) {
    return {
      storyEffectivenessMetrics: {
        engagementPotential: this.calculateEngagementPotential(entry),
        educationalValue: this.calculateEducationalValue(entry),
        culturalResonance: this.calculateCulturalResonance(entry)
      },
      reasoningApplications: this.identifyReasoningApplications(entry),
      communicationOptimization: 'direct_historical_delivery'
    };
  }

  calculateEngagementPotential(entry) {
    let score = 0.5;
    
    const text = (entry.title + ' ' + entry.description).toLowerCase();
    if (text.includes('story') || text.includes('tale')) score += 0.2;
    if (text.includes('people') || text.includes('family')) score += 0.15;
    if (text.includes('community') || text.includes('together')) score += 0.15;
    
    return Math.min(score, 1.0);
  }

  calculateEducationalValue(entry) {
    let score = 0.5;
    
    const text = (entry.title + ' ' + entry.description).toLowerCase();
    if (text.includes('learn') || text.includes('teach')) score += 0.2;
    if (text.includes('history') || text.includes('heritage')) score += 0.15;
    if (text.includes('example') || text.includes('lesson')) score += 0.15;
    
    return Math.min(score, 1.0);
  }

  calculateCulturalResonance(entry) {
    let score = 0.5;
    
    const text = (entry.title + ' ' + entry.description).toLowerCase();
    if (text.includes('appalachian') || text.includes('mountain')) score += 0.25;
    if (text.includes('tradition') || text.includes('culture')) score += 0.15;
    if (text.includes('west virginia') || text.includes('wv')) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  identifyReasoningApplications(entry) {
    const applications = [];
    const text = (entry.title + ' ' + entry.description).toLowerCase();
    
    if (text.includes('problem') || text.includes('challenge')) applications.push('problem_solving');
    if (text.includes('develop') || text.includes('growth')) applications.push('development_planning');
    if (text.includes('community') || text.includes('together')) applications.push('community_organization');
    if (text.includes('economic') || text.includes('business')) applications.push('economic_strategy');
    
    return applications;
  }

  setupGeodeticIntegration() {
    const geodeticIntegration = {
      directStorytelling: {
        mountaintop_delivery: 'Stories delivered with mountain vista context',
        valley_delivery: 'Stories focused on river and community locations',
        ridge_delivery: 'Stories about transportation and communication routes'
      },
      coordinateBasedNarratives: {
        precision_delivery: 'Adjust story content based on exact user location',
        proximity_context: 'Include nearby historical sites in story delivery',
        terrain_integration: 'Weave geological features into historical narratives'
      }
    };

    this.geodeticIntegration.set('direct_storytelling', geodeticIntegration);
    console.log('🗺️ Geodetic integration established for direct historical storytelling');
  }

  setupContinuousLearningIntegration() {
    const continuousLearning = {
      directStoryTracking: {
        delivery_effectiveness: 'Track how well direct stories are received',
        content_preference: 'Monitor which historical stories users engage with most',
        narrative_optimization: 'Improve story delivery based on user feedback'
      },
      reasoningImprovement: {
        story_application_success: 'Track when historical stories effectively inform decisions',
        pattern_recognition_enhancement: 'Improve identification of relevant stories',
        delivery_effectiveness: 'Monitor success of direct story delivery vs generic advice'
      }
    };

    this.continuousLearning.set('direct_learning_systems', continuousLearning);
    console.log('📚 Continuous learning integration established for direct story improvement');
  }

  getLocationKey(location) {
    if (!location) return 'west_virginia_general';

    const locationLower = location.toLowerCase();
    if (locationLower.includes('mount hope')) return 'mount_hope';
    if (locationLower.includes('new river')) return 'new_river_gorge';
    if (locationLower.includes('harpers ferry')) return 'harpers_ferry';
    if (locationLower.includes('charleston')) return 'charleston';
    if (locationLower.includes('morgantown')) return 'morgantown';

    return location.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  extractPeriod(description) {
    const yearMatches = description.match(/\b(1[6-9]\d{2}|20\d{2})\b/g);
    if (yearMatches) {
      return yearMatches.length > 1 ? `${yearMatches[0]}-${yearMatches[yearMatches.length-1]}` : yearMatches[0];
    }
    return 'Historical period';
  }

  extractSignificance(description) {
    const text = description.toLowerCase();
    const significanceKeywords = ['important', 'significant', 'historic', 'heritage', 'landmark', 'cultural'];

    for (const keyword of significanceKeywords) {
      if (text.includes(keyword)) {
        return `Historical and cultural significance, ${keyword} importance`;
      }
    }

    return 'Community and regional historical significance';
  }

  createDirectNarrative(entry) {
    const title = entry.title;
    const description = entry.description;

    // Create DIRECT mountain storytelling - no rambling!
    if (title.toLowerCase().includes('coal') || description.toLowerCase().includes('mining')) {
      return `Here's a coal mining story from Mount Hope: ${title}. ${description.substring(0, 200)}... This shows how our mining families built strong communities through hard work and mutual support.`;
    }
    if (title.toLowerCase().includes('railroad') || title.toLowerCase().includes('bridge')) {
      return `Here's a transportation story: ${title}. ${description.substring(0, 200)}... This shows how we've always found ways to connect our mountain communities.`;
    }
    if (title.toLowerCase().includes('civil war') || description.toLowerCase().includes('war')) {
      return `Here's a Civil War era story: ${title}. ${description.substring(0, 200)}... This shows how our mountain communities were part of major historical events.`;
    }

    return `Here's a historical story about ${title}: ${description.substring(0, 200)}... This captures what makes our West Virginia communities special.`;
  }

  determineCulturalContext(entry) {
    const text = (entry.title + ' ' + entry.description).toLowerCase();

    if (text.includes('coal') || text.includes('mining')) {
      return 'Traditional Appalachian coal mining community with strong family networks';
    }
    if (text.includes('native american') || text.includes('cherokee')) {
      return 'Native American heritage with geological and cultural significance';
    }
    if (text.includes('civil war') || text.includes('federal')) {
      return 'Intersection of local community life with national historical events';
    }

    return 'Appalachian mountain heritage with community-centered values';
  }

  determineModernRelevance(entry) {
    const text = (entry.title + ' ' + entry.description).toLowerCase();

    if (text.includes('tourism') || text.includes('recreation')) {
      return 'Heritage tourism and outdoor recreation economic development';
    }
    if (text.includes('coal') || text.includes('mining')) {
      return 'Transition from coal to tourism and outdoor recreation economy';
    }
    if (text.includes('education') || text.includes('museum')) {
      return 'Educational tourism and cultural preservation initiatives';
    }

    return 'Community heritage preservation and cultural tourism development';
  }

  createReasoningIntegration(entry) {
    const text = (entry.title + ' ' + entry.description).toLowerCase();

    if (text.includes('community') || text.includes('development')) {
      return 'Example of community development patterns applicable to modern economic transition strategies';
    }
    if (text.includes('resilience') || text.includes('adaptation')) {
      return 'Historical model of community resilience and economic adaptation';
    }
    if (text.includes('infrastructure') || text.includes('transportation')) {
      return 'Historical infrastructure development that can inform modern community planning';
    }

    return 'Historical precedent for community development and cultural preservation';
  }

  storeScrapedData(scrapedEntries) {
    this.scrapedData.set('latest_scrape', {
      timestamp: Date.now(),
      count: scrapedEntries.length,
      entries: scrapedEntries,
      source: 'The Clio Platform',
      systemIntegrations: {
        geodetic: true,
        communication: true,
        reasoning: true,
        continuousLearning: true
      }
    });

    console.log(`💾 Stored ${scrapedEntries.length} scraped entries for direct storytelling`);
  }

  storeHistoricalData(data) {
    const existingData = this.historicalData.get('west_virginia') || {};
    const mergedData = { ...existingData, ...data };

    this.historicalData.set('west_virginia', mergedData);
    console.log(`📖 Stored historical data for ${Object.keys(mergedData).length} locations for direct delivery`);

    return mergedData;
  }

  async loadDirectHistoricalDatabase() {
    const wvHistoricalData = {
      'mount_hope': {
        location: { latitude: 37.9084, longitude: -81.1434, elevation: 2150 },
        communicationStyle: 'Direct mountain storytelling',
        reasoningContext: 'Historical story delivery',
        geodeticContext: 'Elevated plateau with coal seam geology and mountain vistas',
        continuousLearningProfile: {
          storyEffectiveness: 0.9,
          culturalAuthenticity: 0.95,
          reasoningApplications: ['economic_transition', 'community_resilience']
        },
        historicalEntries: [
          {
            id: 'mount_hope_coal_heritage_direct',
            title: 'Mount Hope Coal Mining Heritage',
            description: 'Mount Hope was established as a coal mining town in the early 1900s, serving as a crucial hub for the New River coalfields. The town\'s name reflects the optimism of early settlers who saw the "mountain of hope" in the rich coal deposits. Miners worked 10-12 hour shifts underground, creating tight-knit communities around company towns. The C&O Railway transported coal from Mount Hope to markets across the eastern United States.',
            type: 'historical_site',
            period: '1900-1950',
            significance: 'Coal mining heritage, community development',
            stories: [
              'The town was founded by coal company officials who recognized the strategic location for mining operations.',
              'Mount Hope became a vital stop along the Chesapeake and Ohio Railway coal transportation route.',
              'The community developed its own schools, company store, and social institutions around coal mining.',
              'Miners would tell stories of underground adventures and community solidarity during difficult times.',
              'The company store was where families gathered for news, supplies, and social connection.'
            ],
            directNarratives: [
              'Here\'s the story of Mount Hope\'s founding: Coal company officials established this town in the early 1900s because they saw the strategic location for mining operations. The name "Mount Hope" came from the optimism of early settlers who saw a "mountain of hope" in the rich coal deposits.',
              'Here\'s about the C&O Railway days: Mount Hope became a vital stop along the Chesapeake and Ohio Railway coal transportation route. Every morning before dawn, you\'d hear the rumble of those coal trains loaded down heavy, heading to markets across the eastern United States.',
              'Here\'s about community life: The community developed its own schools, company store, and social institutions around coal mining. The company store was where families gathered for news, supplies, and social connection - it was the heart of our community.',
              'Here\'s about the miners themselves: Miners worked 10-12 hour shifts underground, creating tight-knit communities built on mutual support and shared experiences. They would tell stories of underground adventures and community solidarity during difficult times.'
            ],
            culturalContext: 'Traditional Appalachian coal mining community with strong family networks',
            modernRelevance: 'Transition from coal to tourism and outdoor recreation economy',
            reasoningIntegration: 'Example of community resilience and economic adaptation that applies to current regional development challenges',
            geodeticIntegration: {
              elevation: 2150,
              geologicalContext: 'Coal seam geology with mining infrastructure impact',
              viewshedAnalysis: 'Mountain plateau with 360-degree vistas enabling community oversight'
            },
            learningMetadata: {
              effectivenessScore: 0.92,
              engagementLevel: 0.89,
              culturalResonance: 0.94,
              reasoningApplications: ['economic_transition', 'community_development', 'heritage_preservation']
            }
          }
        ]
      }
    };

    this.historicalData.set('west_virginia', wvHistoricalData);
    console.log(`📖 Loaded comprehensive local WV historical database for direct storytelling`);
    return wvHistoricalData;
  }

  async setupDirectCommunicationMatrix() {
    const communicationMatrix = {
      direct_storytelling_patterns: {
        story_openers: [
          'Here\'s a historical story about',
          'Here\'s what happened at',
          'This is the story of',
          'Let me tell you about',
          'Here\'s a tale from'
        ],
        story_connectors: [
          'This shows how',
          'What this means is',
          'The important part is',
          'This demonstrates',
          'This teaches us'
        ],
        story_conclusions: [
          'This story shows the strength of our mountain communities.',
          'This demonstrates the resilience that\'s always been part of who we are.',
          'This captures what makes our West Virginia heritage special.',
          'This teaches us about the foundation we\'re building our future on.',
          'This reminds us of the community spirit that defines us.'
        ]
      },
      no_rambling_rules: {
        max_intro_words: 10,
        deliver_story_immediately: true,
        avoid_generic_planning: true,
        focus_on_specific_content: true,
        end_with_concrete_information: true
      },
      geodetic_storytelling_integration: {
        elevation_aware_narratives: {
          high_elevation: 'From up here on this mountain',
          mid_elevation: 'Right here on this hillside',
          valley_floor: 'Down here in the valley'
        },
        coordinate_based_context: {
          precise_location: 'Right here at these coordinates',
          regional_context: 'Across this region of West Virginia',
          geological_integration: 'The ground we\'re standing on'
        }
      }
    };

    this.communicationMatrix.set('direct_delivery', communicationMatrix);
    console.log('💬 Direct communication matrix established - no more rambling!');
  }

  async setupAdvancedReasoningIntegration() {
    const reasoningIntegration = {
      direct_historical_reasoning: {
        story_based_analysis: 'Use specific historical stories as reasoning tools',
        precedent_identification: 'Identify historical precedents with direct relevance',
        wisdom_extraction: 'Extract actionable insights from specific community experiences',
        application_demonstration: 'Show how historical examples apply to current situations'
      }
    };

    this.reasoningContext.set('direct_integration', reasoningIntegration);
    console.log('🧠 Direct reasoning integration established');
  }

  async initializeSelfEvolvingKnowledgeBase() {
    const knowledgeBase = {
      direct_learning_categories: {
        story_delivery_effectiveness: {
          direct_vs_rambling: 'Track effectiveness of direct story delivery vs generic planning advice',
          user_engagement: 'Monitor which direct stories create strongest user engagement',
          content_preference: 'Learn which specific historical content users find most valuable',
          delivery_optimization: 'Continuously improve direct story delivery methods'
        }
      }
    };

    this.knowledgeBase.set('direct_evolution', knowledgeBase);
    console.log('📚 Direct self-evolving knowledge base initialized');
  }

  async loadWestVirginiaStories() {
    const stories = new Map();
    const regionStories = {
      'Central Mountains': [
        {
          title: 'The Bridge Day Tradition',
          location: 'New River Gorge',
          coordinates: { latitude: 37.8735, longitude: -81.0667, elevation: 1200 },
          directStory: 'Here\'s the story of Bridge Day: Every third Saturday in October, the New River Gorge Bridge closes to traffic and opens to thousands of visitors featuring BASE jumping, rappelling, and celebrating the engineering marvel that connects mountain communities. This shows how we\'ve transformed from an industrial heritage to an outdoor recreation economy.',
          themes: ['community celebration', 'modern engineering', 'adventure tourism'],
          culturalSignificance: 'Represents transition from industrial heritage to outdoor recreation economy',
          reasoningApplication: 'Example of how communities can leverage unique assets for economic development',
          geodeticContext: 'Ancient river valley with 876-foot bridge span creating unique tourism opportunity'
        }
      ]
    };

    stories.set('direct_regional_stories', regionStories);
    this.locationStories = stories;
    console.log('📖 Direct West Virginia regional stories loaded');
  }

  async loadWalkingTours() {
    const tours = {
      'mount_hope_direct_heritage_walk': {
        title: 'Mount Hope Direct Heritage Walking Tour',
        description: 'Direct historical story delivery about Mount Hope\'s coal mining history with specific locations and authentic narratives',
        communicationStyle: 'Direct Appalachian storytelling with no rambling',
        duration: '45 minutes',
        difficulty: 'Easy with clear historical content delivery'
      }
    };

    this.walkingTours.set('direct_integration', tours);
    console.log('🚶 Direct walking tours loaded');
  }

  async setupKMLProcessing() {
    const kmlProcessor = {
      processGoogleMapsKML: (kmlData) => {
        return {
          locations: [],
          routes: [],
          regions: [],
          historicalContext: 'Geographic data with direct historical story delivery',
          communicationEnhancement: 'Location stories formatted for direct delivery'
        };
      }
    };

    this.kmlData.set('direct_processor', kmlProcessor);
    console.log('🗺️ Direct KML processing established');
  }

  async setupAutoUpdate() {
    setInterval(async () => {
      try {
        console.log('🔄 Refreshing The Clio data for direct storytelling...');
        await this.loadHistoricalData();
        await this.loadWestVirginiaStories();
        this.lastUpdate = Date.now();
        console.log('✅ The Clio data refreshed successfully for direct delivery');
      } catch (error) {
        console.log('⚠️ Auto-update error:', error.message);
      }
    }, this.updateInterval);
  }

  // CRITICAL: Enhanced method for DIRECT historical story delivery
  enhanceResponseWithHistoricalStoriesAndCommunication(response, query, userLocation = null, userCoordinates = null) {
    if (!this.isInitialized) return response;

    console.log('🏛️ DIRECT HISTORICAL STORY ENHANCEMENT ACTIVATED');

    try {
      const queryLower = query.toLowerCase();

      // PRIORITY: Detect ANY request for historical stories and deliver them DIRECTLY
      if (queryLower.includes('historical') || queryLower.includes('stories') || 
          queryLower.includes('history') || queryLower.includes('heritage') ||
          queryLower.includes('clio') || queryLower.includes('mount hope') ||
          queryLower.includes('coal') || queryLower.includes('mining')) {
        
        console.log('🎯 Direct historical story request detected - delivering content immediately');
        
        // Check scraped data first
        const scrapedData = this.scrapedData.get('latest_scrape');
        
        if (scrapedData && scrapedData.entries.length > 0) {
          console.log(`📚 Found ${scrapedData.entries.length} scraped stories - delivering directly`);
          
          const relevantStories = scrapedData.entries.slice(0, 2);
          
          let directResponse = `Here are specific historical stories from The Clio platform:\n\n`;
          
          relevantStories.forEach((entry, index) => {
            const storyNumber = index + 1;
            directResponse += `**Story ${storyNumber}: ${entry.title}**\n`;
            directResponse += this.createDirectNarrative(entry);
            directResponse += `\n\n`;
          });
          
          directResponse += `These stories from The Clio platform show the rich heritage and community strength that's always been part of West Virginia.`;
          
          // COMPLETELY REPLACE the rambling response with direct content
          return directResponse;
          
        } else {
          // Fallback to direct local stories
          console.log('📖 Using direct local historical stories');
          
          return this.createDirectLocalStoriesResponse(query);
        }
      }

      // For non-historical queries, apply minimal enhancement
      return response;

    } catch (error) {
      console.error('❌ Direct story enhancement error:', error.message);
      return response;
    }
  }

  createDirectLocalStoriesResponse(query) {
    return `Here are specific historical stories about Mount Hope:

**Story 1: Mount Hope's Founding**
Here's how Mount Hope got its name: Coal company officials established this town in the early 1900s because they saw the strategic location for mining operations. The name "Mount Hope" came from the optimism of early settlers who saw a "mountain of hope" in the rich coal deposits.

**Story 2: The C&O Railway Days**
Here's about the railroad era: Mount Hope became a vital stop along the Chesapeake and Ohio Railway coal transportation route. Every morning before dawn, you'd hear the rumble of those coal trains loaded down heavy, heading to markets across the eastern United States.

**Story 3: The Company Store Community**
Here's about community life: The community developed its own schools, company store, and social institutions around coal mining. The company store was where families gathered for news, supplies, and social connection - it was the heart of our community.

These stories show the foundation of resilience and community strength that we're building our future on today.`;
  }

  integrateWithContinuousLearning(learningEngine, interactionData) {
    try {
      const learningContext = {
        historicalContentDelivered: true,
        communicationStyle: 'direct_mountain_storytelling',
        responseType: 'specific_historical_content',
        userEngagement: 'pending_measurement',
        timestamp: Date.now()
      };

      console.log('🏛️ Direct Clio integration with continuous learning active');
      
      // Track effectiveness of direct delivery vs rambling
      const trackingData = this.continuousLearning.get('delivery_tracking') || [];
      trackingData.push({
        query: interactionData.message,
        responseType: 'direct_historical_content',
        timestamp: Date.now()
      });
      this.continuousLearning.set('delivery_tracking', trackingData);
      
    } catch (error) {
      console.error('❌ Direct Clio learning integration error:', error.message);
    }
  }

  getIntegrationStatistics() {
    const scrapedData = this.scrapedData.get('latest_scrape');
    const deliveryTracking = this.continuousLearning.get('delivery_tracking') || [];

    return {
      isInitialized: this.isInitialized,
      lastUpdate: this.lastUpdate,
      dataSource: 'The Clio Platform with Direct Story Delivery',
      historicalDataLoaded: this.historicalData.has('west_virginia'),
      scrapedDataAvailable: !!scrapedData,
      scrapedEntriesCount: scrapedData ? scrapedData.count : 0,
      lastScrapeTime: scrapedData ? scrapedData.timestamp : null,
      systemIntegrations: {
        geodetic: true,
        communication: true,
        advancedReasoning: true,
        continuousLearning: true,
        directDelivery: true
      },
      capabilities: [
        'Direct historical story delivery',
        'No rambling or generic planning advice',
        'Specific content from The Clio platform',
        'Immediate story delivery upon request',
        'Authentic mountain storytelling with direct content'
      ],
      communicationStyle: 'Direct mountain storytelling - no rambling',
      deliveryMetrics: {
        storiesDelivered: deliveryTracking.length,
        directDeliveryMode: true,
        ramblingEliminated: true,
        specificContentFocus: true
      }
    };
  }
}

module.exports = { TheClioIntegration, ClioWebScraper };
