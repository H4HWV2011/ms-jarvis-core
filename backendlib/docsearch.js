const fs = require('fs');
const path = require('path');

// Enhanced document directories with expanded knowledge base
const DOCUMENT_DIRECTORIES = [
  path.join(__dirname, '../data'),
  path.join(__dirname, '../data/expanded-docs'),
  path.join(__dirname, '../docs'),
  path.join(__dirname, '../knowledge')
];

// Expanded MountainShares Priority Documents
const PRIORITY_DOCUMENTS = [
  'MountainShares Darwin Gödel Machine_ AI-Powered Sy.txt',
  'The Role of the MountainShares Darwin Gödel Machin.txt', 
  'MountainShares Governance System - Technical Docum.txt',
  'MountainShares Community Economic Development.txt',
  'MountainShares Heritage NFT Platform.txt',
  'MountainShares Crisis Response Protocol.txt',
  'MountainShares Employee Rewards System.txt',
  'MountainShares_Community_Economic_Development.txt',
  'MountainShares_Heritage_NFT_Platform.txt',
  'MountainShares_Crisis_Response_Protocol.txt'
];

// Enhanced document categories for better search relevance
const DOCUMENT_CATEGORIES = {
  technical: {
    keywords: ['system', 'technical', 'architecture', 'implementation', 'code', 'smart contract'],
    weight: 1.2
  },
  economic: {
    keywords: ['economic', 'financial', 'currency', 'business', 'revenue', 'development'],
    weight: 1.1
  },
  cultural: {
    keywords: ['heritage', 'cultural', 'community', 'appalachian', 'nft', 'art'],
    weight: 1.0
  },
  governance: {
    keywords: ['governance', 'democratic', 'voting', 'community', 'decision'],
    weight: 1.1
  },
  crisis: {
    keywords: ['crisis', 'emergency', 'response', 'disaster', 'flood', 'weather'],
    weight: 1.3
  },
  general: {
    keywords: ['mountainshares', 'mount hope', 'west virginia', 'appalachian'],
    weight: 0.9
  }
};

// Enhanced document loading with expanded knowledge base
function loadDocuments() {
  console.log('📚 Loading expanded MountainShares knowledge base...');
  const documents = {};
  let totalDocuments = 0;
  let totalSize = 0;

  // Load documents from all directories
  DOCUMENT_DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`📂 Scanning directory: ${dir}`);
      const files = fs.readdirSync(dir);
      
      files.filter(file => file.endsWith('.txt')).forEach(file => {
        try {
          const filePath = path.join(dir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          if (content.length > 100) {
            // Enhanced content preprocessing
            const processedContent = preprocessDocumentContent(content, file);
            
            documents[file] = processedContent;
            totalDocuments++;
            totalSize += content.length;
            
            console.log(`📄 Loaded: ${file} (${Math.round(content.length / 1024)}KB)`);
          }
        } catch (error) {
          console.error(`❌ Error loading ${file}:`, error.message);
        }
      });
    } else {
      console.log(`⚠️ Directory not found: ${dir}`);
    }
  });

  console.log(`✅ Expanded knowledge base loaded: ${totalDocuments} documents, ${Math.round(totalSize / 1024)}KB total`);
  console.log(`📋 Priority documents available: ${PRIORITY_DOCUMENTS.filter(doc => documents[doc]).length}/${PRIORITY_DOCUMENTS.length}`);
  
  return documents;
}

// Enhanced content preprocessing for better search results
function preprocessDocumentContent(content, filename) {
  // Remove excessive whitespace while preserving structure
  let processed = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Add document metadata for enhanced search
  const metadata = generateDocumentMetadata(content, filename);
  processed = `[DOCUMENT: ${filename}]\n[CATEGORY: ${metadata.category}]\n[TOPICS: ${metadata.topics.join(', ')}]\n\n${processed}`;
  
  return processed;
}

// Generate metadata for enhanced document categorization
function generateDocumentMetadata(content, filename) {
  const contentLower = content.toLowerCase();
  let category = 'general';
  let maxScore = 0;
  
  // Determine primary category
  Object.entries(DOCUMENT_CATEGORIES).forEach(([cat, data]) => {
    let score = 0;
    data.keywords.forEach(keyword => {
      const matches = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
      score += matches * data.weight;
    });
    
    if (score > maxScore) {
      maxScore = score;
      category = cat;
    }
  });
  
  // Extract topics based on content analysis
  const topics = extractTopicsFromContent(contentLower);
  
  return {
    category: category,
    topics: topics,
    priority: PRIORITY_DOCUMENTS.includes(filename),
    size: content.length,
    wordCount: content.split(/\s+/).length
  };
}

// Enhanced topic extraction for better search relevance
function extractTopicsFromContent(contentLower) {
  const topicPatterns = {
    'ai_systems': /\b(artificial intelligence|ai|machine learning|darwin|gödel|neural network)\b/g,
    'blockchain': /\b(blockchain|smart contract|cryptocurrency|token|nft)\b/g,
    'community': /\b(community|neighborhood|local|resident|citizen|democratic)\b/g,
    'economics': /\b(economic|financial|revenue|budget|investment|currency)\b/g,
    'culture': /\b(cultural|heritage|traditional|appalachian|music|art)\b/g,
    'technology': /\b(technology|system|platform|software|digital)\b/g,
    'governance': /\b(governance|voting|decision|policy|management)\b/g,
    'crisis': /\b(emergency|crisis|disaster|flood|weather|response)\b/g,
    'business': /\b(business|enterprise|entrepreneur|market|commerce)\b/g,
    'education': /\b(education|learning|training|knowledge|skills)\b/g
  };
  
  const topics = [];
  Object.entries(topicPatterns).forEach(([topic, pattern]) => {
    const matches = contentLower.match(pattern);
    if (matches && matches.length >= 2) { // Require at least 2 mentions
      topics.push(topic);
    }
  });
  
  return topics;
}

// Enhanced search function maintaining TF-IDF approach but with better categorization
function searchDocuments(query, docs, topK = 5) {
  const qwords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  let found = [];

  const termDocCounts = {};
  const totalDocs = Object.keys(docs).length;

  qwords.forEach(term => {
    termDocCounts[term] = 0;
    Object.values(docs).forEach(content => {
      if (content.toLowerCase().includes(term)) {
        termDocCounts[term]++;
      }
    });
  });

  for (const [fname, txt] of Object.entries(docs)) {
    const isLargeGenericDoc = txt.length > 1000000;
    const paras = txt.split(/\n\s*\n/);
    const isPriorityDoc = PRIORITY_DOCUMENTS.includes(fname);

    for (const p of paras) {
      const pLower = p.toLowerCase();
      let matches = 0;
      let totalRelevance = 0;
      let exactPhraseBonus = 0;
      let categoryBonus = 0;

      const queryLower = query.toLowerCase().replace(/[^\w\s]/g, '');
      if (pLower.includes(queryLower)) {
        exactPhraseBonus = 10000;
      }

      qwords.forEach(q => {
        const termCount = (pLower.match(new RegExp(`\\b${q}\\b`, 'g')) || []).length;
        if (termCount > 0) {
          matches += termCount;
          const docFrequency = termDocCounts[q] || 1;
          const idfWeight = Math.log(totalDocs / docFrequency) + 1;
          totalRelevance += termCount * q.length * idfWeight * 100;
        }
      });

      // Enhanced filename bonus with priority weighting
      const filenameLower = fname.toLowerCase();
      let filenameBonus = 0;
      qwords.forEach(q => {
        if (filenameLower.includes(q)) {
          const docFreq = termDocCounts[q] || 1;
          const idfWeight = Math.log(totalDocs / docFreq) + 1;
          filenameBonus += 500 * idfWeight;
        }
      });

      // Priority document bonus
      let priorityBonus = isPriorityDoc ? 2000 : 0;

      // Category relevance bonus
      Object.entries(DOCUMENT_CATEGORIES).forEach(([category, data]) => {
        data.keywords.forEach(keyword => {
          if (queryLower.includes(keyword)) {
            categoryBonus += 1000 * data.weight;
          }
        });
      });

      if (matches > 0 && p.trim().length > 50) {
        let finalScore = totalRelevance + exactPhraseBonus + filenameBonus + priorityBonus + categoryBonus;
        if (isLargeGenericDoc) finalScore = finalScore * 0.05;

        found.push({
          file: fname.replace('.txt', ''),
          paragraph: p.trim().slice(0, 800),
          score: Math.round(finalScore),
          matches: matches,
          exactPhrase: exactPhraseBonus > 0,
          filenameMatch: filenameBonus > 0,
          isPriority: isPriorityDoc,
          categoryRelevant: categoryBonus > 0
        });
      }
    }
  }

  // Enhanced sorting: priority documents first, then by score
  found.sort((a, b) => {
    if (a.isPriority && !b.isPriority) return -1;
    if (b.isPriority && !a.isPriority) return 1;
    if (a.exactPhrase && !b.exactPhrase) return -1;
    if (b.exactPhrase && !a.exactPhrase) return 1;
    return b.score - a.score;
  });

  return found.slice(0, topK);
}

module.exports = {
  loadDocuments,
  searchDocuments,
};
