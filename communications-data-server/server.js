// communications-data-server/server.js - Unlimited Communications Data Collection Server
const express = require('express');
const { MongoClient } = require('mongodb');
const AWS = require('aws-sdk');
const { Client } = require('@elastic/elasticsearch');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://ms-jarvis-core-jc2p6l2hf-ms-jarvis.vercel.app'],
  methods: ['GET', 'POST', 'PUT'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Database connections
let db, elasticsearch;

// MongoDB connection for structured conversation data
const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/ms-jarvis-communications');

// Elasticsearch for advanced search capabilities
const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});

// AWS S3 for unlimited raw data storage
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Communication data model
class CommunicationData {
  constructor(userMessage, aiResponse, userId, metadata = {}) {
    this.id = uuidv4();
    this.timestamp = new Date();
    this.userMessage = userMessage;
    this.aiResponse = aiResponse;
    this.userId = userId;
    this.metadata = {
      ...metadata,
      messageLength: userMessage?.length || 0,
      responseLength: aiResponse?.length || 0,
      processingTime: metadata.processingTime || null,
      specialists: metadata.specialists || [],
      confidence: metadata.confidence || null,
      culturalElements: this.extractCulturalElements(aiResponse),
      topics: this.extractTopics(userMessage, aiResponse),
      sentiment: this.analyzeSentiment(userMessage),
      locationContext: this.extractLocationContext(userMessage)
    };
  }

  extractCulturalElements(response) {
    const appalachianTerms = [
      'darlin', 'honey child', 'shugah', 'well now', 'mount hope', 
      'appalachian', 'mountain', 'community', 'neighborly', 'heritage'
    ];
    
    const foundTerms = appalachianTerms.filter(term => 
      response?.toLowerCase().includes(term)
    );
    
    return {
      appalachianTerms: foundTerms,
      culturalScore: foundTerms.length / appalachianTerms.length
    };
  }

  extractTopics(userMessage, aiResponse) {
    const text = `${userMessage} ${aiResponse}`.toLowerCase();
    const topicKeywords = {
      historical: ['history', 'historical', 'heritage', 'coal mining', 'clio'],
      technical: ['code', 'programming', 'technical', 'system', 'api'],
      community: ['community', 'mount hope', 'appalachian', 'neighbors'],
      financial: ['financial', 'economic', 'money', 'budget'],
      creative: ['creative', 'artistic', 'design', 'innovation']
    };

    const topics = [];
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        topics.push(topic);
      }
    }
    return topics;
  }

  analyzeSentiment(message) {
    const positiveWords = ['good', 'great', 'excellent', 'helpful', 'thank'];
    const negativeWords = ['bad', 'terrible', 'problem', 'issue', 'frustrated'];
    
    const messageLower = message?.toLowerCase() || '';
    const positive = positiveWords.filter(word => messageLower.includes(word)).length;
    const negative = negativeWords.filter(word => messageLower.includes(word)).length;
    
    if (positive > negative) return 'positive';
    if (negative > positive) return 'negative';
    return 'neutral';
  }

  extractLocationContext(message) {
    const locations = [
      'mount hope', 'beckley', 'charleston', 'morgantown', 'huntington',
      'fayette county', 'west virginia', 'wv', 'appalachian'
    ];
    
    const messageLower = message?.toLowerCase() || '';
    return locations.filter(location => messageLower.includes(location));
  }
}

// Initialize database connections
async function initializeConnections() {
  try {
    // Connect to MongoDB
    await mongoClient.connect();
    db = mongoClient.db('ms-jarvis-communications');
    console.log('✅ MongoDB connected for communications data storage');

    // Verify Elasticsearch connection
    elasticsearch = elasticClient;
    await elasticsearch.ping();
    console.log('✅ Elasticsearch connected for advanced search capabilities');

    console.log('🗄️ Communications Data Server initialized successfully');
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

// Store communication data endpoint
app.post('/api/store-communication', async (req, res) => {
  try {
    const { userMessage, aiResponse, userId, metadata } = req.body;

    if (!userMessage || !aiResponse || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: userMessage, aiResponse, userId'
      });
    }

    // Create structured communication data
    const commData = new CommunicationData(userMessage, aiResponse, userId, metadata);

    // Store in MongoDB for structured queries
    await db.collection('communications').insertOne(commData);

    // Store in Elasticsearch for advanced search
    await elasticsearch.index({
      index: 'ms-jarvis-communications',
      id: commData.id,
      body: commData
    });

    // Store raw data in S3 for unlimited retention
    const s3Key = `communications/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${commData.id}.json`;
    await s3.putObject({
      Bucket: process.env.S3_BUCKET_NAME || 'ms-jarvis-communications',
      Key: s3Key,
      Body: JSON.stringify(commData, null, 2),
      ContentType: 'application/json'
    }).promise();

    res.json({
      success: true,
      communicationId: commData.id,
      message: 'Communication data stored successfully',
      storage: {
        mongodb: true,
        elasticsearch: true,
        s3: true
      }
    });

  } catch (error) {
    console.error('❌ Error storing communication:', error);
    res.status(500).json({
      error: 'Failed to store communication data',
      details: error.message
    });
  }
});

// Knowledge base analytics endpoint
app.get('/api/knowledge-analytics', async (req, res) => {
  try {
    const { timeframe = '30d', userId } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90));

    const matchQuery = {
      timestamp: { $gte: startDate, $lte: endDate }
    };

    if (userId) {
      matchQuery.userId = userId;
    }

    // Aggregate communication data for insights
    const analytics = await db.collection('communications').aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalCommunications: { $sum: 1 },
          averageResponseLength: { $avg: '$metadata.responseLength' },
          averageProcessingTime: { $avg: '$metadata.processingTime' },
          topTopics: { $push: '$metadata.topics' },
          culturalScores: { $push: '$metadata.culturalElements.culturalScore' },
          sentimentDistribution: { $push: '$metadata.sentiment' },
          locations: { $push: '$metadata.locationContext' }
        }
      }
    ]).toArray();

    // Get topic frequency
    const topicStats = await db.collection('communications').aggregate([
      { $match: matchQuery },
      { $unwind: '$metadata.topics' },
      { $group: { _id: '$metadata.topics', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    res.json({
      timeframe,
      analytics: analytics[0] || {},
      topTopics: topicStats,
      dataAvailable: true,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('❌ Error generating analytics:', error);
    res.status(500).json({
      error: 'Failed to generate knowledge analytics',
      details: error.message
    });
  }
});

// Search communications endpoint for knowledge retrieval
app.post('/api/search-knowledge', async (req, res) => {
  try {
    const { query, limit = 10, topics, sentiment, userId } = req.body;

    const searchBody = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: query,
                fields: ['userMessage^2', 'aiResponse^1.5', 'metadata.topics'],
                type: 'best_fields'
              }
            }
          ],
          filter: []
        }
      },
      highlight: {
        fields: {
          userMessage: {},
          aiResponse: {}
        }
      },
      size: limit,
      sort: [
        { timestamp: { order: 'desc' } }
      ]
    };

    // Apply filters
    if (topics && topics.length > 0) {
      searchBody.query.bool.filter.push({
        terms: { 'metadata.topics': topics }
      });
    }

    if (sentiment) {
      searchBody.query.bool.filter.push({
        term: { 'metadata.sentiment': sentiment }
      });
    }

    if (userId) {
      searchBody.query.bool.filter.push({
        term: { userId: userId }
      });
    }

    const searchResults = await elasticsearch.search({
      index: 'ms-jarvis-communications',
      body: searchBody
    });

    const results = searchResults.body.hits.hits.map(hit => ({
      id: hit._id,
      score: hit._score,
      source: hit._source,
      highlights: hit.highlight
    }));

    res.json({
      query,
      totalResults: searchResults.body.hits.total.value,
      results,
      searchTime: searchResults.body.took
    });

  } catch (error) {
    console.error('❌ Error searching knowledge:', error);
    res.status(500).json({
      error: 'Failed to search knowledge base',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connections
    const mongoStatus = await db.admin().ping();
    const elasticStatus = await elasticsearch.ping();

    res.json({
      status: 'healthy',
      timestamp: new Date(),
      services: {
        mongodb: mongoStatus ? 'connected' : 'disconnected',
        elasticsearch: elasticStatus ? 'connected' : 'disconnected',
        s3: 'configured'
      },
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Start server
async function startServer() {
  await initializeConnections();
  
  app.listen(PORT, () => {
    console.log(`🗄️ Communications Data Server running on port ${PORT}`);
    console.log(`📊 Analytics endpoint: http://localhost:${PORT}/api/knowledge-analytics`);
    console.log(`🔍 Search endpoint: http://localhost:${PORT}/api/search-knowledge`);
    console.log(`💾 Storage endpoint: http://localhost:${PORT}/api/store-communication`);
  });
}

startServer().catch(console.error);

module.exports = app;
