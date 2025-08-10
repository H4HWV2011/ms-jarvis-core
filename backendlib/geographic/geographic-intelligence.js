// backendlib/geographic/geographic-intelligence.js - Geographic Intelligence Integration
const fs = require('fs').promises;
const path = require('path');

class GeographicIntelligence {
  constructor() {
    this.geographicData = new Map();
    this.terrainData = new Map();
    this.economicGeography = new Map();
    this.culturalGeography = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('🗺️ Initializing Geographic Intelligence for Ms. Jarvis...');
      
      await this.loadGeographicKnowledge();
      this.isInitialized = true;
      
      console.log('✅ Geographic Intelligence initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Geographic Intelligence initialization error:', error.message);
      return false;
    }
  }

  async loadGeographicKnowledge() {
    // Load geographic knowledge documents
    const knowledgeDir = './data/geographic/knowledge-base';
    
    try {
      // Check if geographic knowledge exists, if not create basic knowledge
      const files = await fs.readdir(knowledgeDir).catch(() => []);
      
      if (files.length === 0) {
        await this.createBasicGeographicKnowledge();
      } else {
        await this.loadExistingGeographicFiles(knowledgeDir);
      }
    } catch (error) {
      console.log('📄 Creating basic geographic knowledge...');
      await this.createBasicGeographicKnowledge();
    }
  }

  async createBasicGeographicKnowledge() {
    // Create essential geographic knowledge for Mount Hope, WV
    const basicGeography = {
      location: {
        city: 'Mount Hope',
        state: 'West Virginia',
        county: 'Fayette County',
        region: 'Appalachian Mountains',
        coordinates: '37.9009°N, 81.1359°W',
        elevation: '1,847 feet above sea level'
      },
      terrain: {
        type: 'Mountainous',
        slopes: '15-35% grades typical',
        geology: 'Pennsylvanian-age sedimentary rocks',
        elevationRange: '1,150 to 3,215 feet',
        landforms: 'Steep ridges, narrow valleys, plateaus'
      },
      climate: {
        type: 'Humid continental, mountainous',
        precipitation: '45 inches annually',
        temperature: '25°F winter low, 85°F summer high',
        growingSeason: '160-180 days',
        seasons: 'Four distinct seasons'
      },
      naturalResources: {
        forests: '75% forest coverage',
        water: 'New River, mountain springs, tributaries',
        minerals: 'Coal (historical), sandstone, timber',
        wildlife: 'Deer, bear, turkey, diverse bird species',
        recreation: 'Hiking, fishing, outdoor activities'
      },
      economy: {
        historical: 'Coal mining (1800s-2000s)',
        current: 'Government, healthcare, tourism, retail',
        opportunities: 'Outdoor recreation, heritage tourism, remote work',
        challenges: 'Geographic isolation, terrain constraints',
        transportation: 'US Route 19, CSX railroad'
      },
      demographics: {
        population: '1,414 (Mount Hope), 45,000 (Fayette County)',
        density: '69 people per square mile (rural)',
        medianAge: '44.2 years',
        ancestry: 'Scots-Irish, German, English heritage',
        culture: 'Traditional Appalachian values and practices'
      }
    };

    this.geographicData.set('mount_hope_profile', basicGeography);
    
    // Store key geographic contexts for Ms. Jarvis reasoning
    this.terrainData.set('development_constraints', [
      'Steep mountain terrain limits flat land for development',
      'Narrow valleys concentrate settlement and infrastructure',
      'Winding mountain roads increase transportation costs',
      'Site preparation expensive due to topography',
      'Utility installation challenging in mountainous areas'
    ]);

    this.economicGeography.set('opportunities', [
      'New River Gorge tourism and outdoor recreation',
      'Scenic mountain location attracts visitors and remote workers',
      'Traditional crafts and heritage tourism potential',
      'Forest resources for sustainable timber and maple syrup',
      'Clean mountain springs and streams for specialized industries'
    ]);

    this.culturalGeography.set('appalachian_heritage', [
      'Multi-generational family connections to land and place',
      'Traditional mountain skills: woodworking, farming, crafts',
      'Strong community networks and mutual aid traditions',
      'Music, storytelling, and oral history preservation',
      'Self-reliance balanced with community cooperation'
    ]);
  }

  async loadExistingGeographicFiles(knowledgeDir) {
    try {
      const files = await fs.readdir(knowledgeDir);
      
      for (const filename of files) {
        const filepath = path.join(knowledgeDir, filename);
        const content = await fs.readFile(filepath, 'utf8');
        
        // Process different types of geographic knowledge
        if (filename.includes('Geographic_Profile')) {
          this.processGeographicProfile(content);
        } else if (filename.includes('Economic_Geographic')) {
          this.processEconomicGeography(content);
        } else if (filename.includes('Terrain_Resources')) {
          this.processTerrainResources(content);
        } else if (filename.includes('Demographics_Culture')) {
          this.processCulturalGeography(content);
        }
      }
      
      console.log('📚 Loaded existing geographic knowledge files');
    } catch (error) {
      console.log('⚠️ Could not load existing files, using basic knowledge');
    }
  }

  processGeographicProfile(content) {
    // Extract key geographic information for Ms. Jarvis
    const profileData = {
      physicalGeography: this.extractSection(content, 'PHYSICAL GEOGRAPHY'),
      climate: this.extractSection(content, 'CLIMATE AND ENVIRONMENT'),
      transportation: this.extractSection(content, 'TRANSPORTATION GEOGRAPHY'),
      settlements: this.extractSection(content, 'HUMAN GEOGRAPHY')
    };
    
    this.geographicData.set('comprehensive_profile', profileData);
  }

  processEconomicGeography(content) {
    const economicData = {
      currentEconomy: this.extractSection(content, 'CURRENT ECONOMIC GEOGRAPHY'),
      opportunities: this.extractSection(content, 'ECONOMIC DEVELOPMENT OPPORTUNITIES'),
      constraints: this.extractSection(content, 'ECONOMIC DEVELOPMENT CONSTRAINTS'),
      resources: this.extractSection(content, 'FINANCIAL DEVELOPMENT RESOURCES')
    };
    
    this.economicGeography.set('detailed_analysis', economicData);
  }

  processTerrainResources(content) {
    const terrainData = {
      topography: this.extractSection(content, 'TERRAIN ANALYSIS'),
      waterResources: this.extractSection(content, 'WATER RESOURCES'),
      forests: this.extractSection(content, 'FOREST RESOURCES'),
      minerals: this.extractSection(content, 'MINERAL AND ENERGY RESOURCES')
    };
    
    this.terrainData.set('comprehensive_analysis', terrainData);
  }

  processCulturalGeography(content) {
    const culturalData = {
      demographics: this.extractSection(content, 'DEMOGRAPHIC PROFILE'),
      heritage: this.extractSection(content, 'CULTURAL HERITAGE AND ANCESTRY'),
      education: this.extractSection(content, 'EDUCATIONAL GEOGRAPHY'),
      community: this.extractSection(content, 'SOCIAL NETWORKS AND COMMUNITY STRUCTURE')
    };
    
    this.culturalGeography.set('comprehensive_analysis', culturalData);
  }

  extractSection(content, sectionHeader) {
    const lines = content.split('\n');
    let inSection = false;
    let sectionContent = [];
    
    for (const line of lines) {
      if (line.includes(sectionHeader)) {
        inSection = true;
        continue;
      } else if (line.match(/^[A-Z\s]+$/) && line.length > 10 && inSection) {
        // Found next major section header
        break;
      } else if (inSection) {
        sectionContent.push(line);
      }
    }
    
    return sectionContent.join('\n').trim().substring(0, 1000);
  }

  getGeographicContext(query) {
    if (!this.isInitialized) return '';
    
    const queryLower = query.toLowerCase();
    let context = '';
    
    // Determine what geographic information is relevant
    if (queryLower.includes('terrain') || queryLower.includes('land') || queryLower.includes('development')) {
      context += this.getTerrainContext();
    }
    
    if (queryLower.includes('economic') || queryLower.includes('business') || queryLower.includes('opportunity')) {
      context += this.getEconomicGeographicContext();
    }
    
    if (queryLower.includes('community') || queryLower.includes('culture') || queryLower.includes('heritage')) {
      context += this.getCulturalGeographicContext();
    }
    
    if (queryLower.includes('location') || queryLower.includes('where') || queryLower.includes('geography')) {
      context += this.getBasicGeographicContext();
    }
    
    return context;
  }

  getTerrainContext() {
    const terrain = this.geographicData.get('mount_hope_profile')?.terrain || {};
    const constraints = this.terrainData.get('development_constraints') || [];
    
    return `
TERRAIN CONTEXT:
Mount Hope is located in mountainous terrain at ${terrain.elevation || '1,847 feet'} elevation with ${terrain.slopes || 'steep slopes'}. 
Development considerations: ${constraints.slice(0, 3).join('; ')}.
Geology: ${terrain.geology || 'Appalachian sedimentary rocks'}.
`;
  }

  getEconomicGeographicContext() {
    const economy = this.geographicData.get('mount_hope_profile')?.economy || {};
    const opportunities = this.economicGeography.get('opportunities') || [];
    
    return `
ECONOMIC GEOGRAPHY CONTEXT:
Historical economy: ${economy.historical || 'Coal mining based'}.
Current economy: ${economy.current || 'Government, healthcare, tourism'}.
Geographic opportunities: ${opportunities.slice(0, 3).join('; ')}.
Transportation: ${economy.transportation || 'US Route 19 access'}.
`;
  }

  getCulturalGeographicContext() {
    const demographics = this.geographicData.get('mount_hope_profile')?.demographics || {};
    const heritage = this.culturalGeography.get('appalachian_heritage') || [];
    
    return `
CULTURAL GEOGRAPHIC CONTEXT:
Population: ${demographics.population || '1,414 in Mount Hope'}.
Cultural heritage: ${demographics.ancestry || 'Scots-Irish, German, English'}.
Appalachian values: ${heritage.slice(0, 3).join('; ')}.
Community character: Rural mountain community with strong family and neighbor networks.
`;
  }

  getBasicGeographicContext() {
    const location = this.geographicData.get('mount_hope_profile')?.location || {};
    const climate = this.geographicData.get('mount_hope_profile')?.climate || {};
    
    return `
BASIC GEOGRAPHIC CONTEXT:
Location: ${location.city || 'Mount Hope'}, ${location.county || 'Fayette County'}, ${location.state || 'West Virginia'}.
Region: ${location.region || 'Appalachian Mountains'}.
Elevation: ${location.elevation || '1,847 feet above sea level'}.
Climate: ${climate.type || 'Humid continental, mountainous'}.
Setting: Rural mountain community in the heart of Appalachian region.
`;
  }

  enhanceResponseWithGeography(response, originalQuery) {
    if (!this.isInitialized) return response;
    
    try {
      // Add natural geographic references appropriate to the context
      let enhanced = response;
      
      // Add geographic context when discussing development or planning
      if (originalQuery.toLowerCase().includes('develop') || originalQuery.toLowerCase().includes('plan')) {
        if (!enhanced.includes('mountain') && !enhanced.includes('terrain')) {
          enhanced += '\n\nKeep in mind our mountain terrain here in Mount Hope - those steep slopes and narrow valleys mean we gotta be thoughtful about any development plans, but our scenic location is also one of our greatest assets.';
        }
      }
      
      // Add economic geography context for business discussions
      if (originalQuery.toLowerCase().includes('business') || originalQuery.toLowerCase().includes('economic')) {
        if (!enhanced.includes('tourism') && !enhanced.includes('New River')) {
          enhanced += '\n\nBeing so close to the New River Gorge gives us real opportunities for tourism and outdoor recreation businesses, which could be a good fit for our mountain setting.';
        }
      }
      
      return enhanced;
    } catch (error) {
      console.error('❌ Geographic enhancement error:', error.message);
      return response;
    }
  }

  getGeographicStatistics() {
    return {
      totalGeographicData: this.geographicData.size,
      terrainDatasets: this.terrainData.size,
      economicGeographicData: this.economicGeography.size,
      culturalGeographicData: this.culturalGeography.size,
      dataSource: 'public_geographic_datasets_appalachian_region',
      coverage: 'mount_hope_fayette_county_appalachian_context'
    };
  }
}

module.exports = { GeographicIntelligence };
