#!/bin/bash
# scripts/run-aapcappe-integration.sh - Complete AAPCAppE Integration Workflow

set -e  # Exit on any error

echo "🏔️ Starting AAPCAppE Cultural Integration for Ms. Jarvis..."

# Change to project directory
cd ~/ms-jarvis-core

# Create necessary directories
mkdir -p data/aapcappe-corpus/{raw-data,transcripts,audio-metadata,processed,cultural-extracts}
mkdir -p data/appalachian-culture/aapcappe-verified

# Step 1: Extract data from AAPCAppE
echo "📚 Step 1: Extracting data from AAPCAppE corpus..."
python3 scripts/aapcappe-integration/aapcappe-extractor.py

# Step 2: Process cultural data for Ms. Jarvis
echo "🧠 Step 2: Processing cultural data for Ms. Jarvis integration..."
node -e "
const { AAPCAppECulturalProcessor } = require('./backendlib/cultural-integration/aapcappe-processor.js');

async function main() {
  const processor = new AAPCAppECulturalProcessor();
  
  // Load extracted AAPCAppE data
  const success = await processor.loadAAPCAppEData('./data/aapcappe-corpus');
  
  if (success) {
    // Generate enhanced knowledge documents
    await processor.generateEnhancedKnowledgeDocuments('./data/appalachian-culture/aapcappe-verified');
    
    // Display statistics
    const stats = processor.getCulturalStatistics();
    console.log('📊 Cultural Integration Statistics:');
    console.log('  Total Authentic Patterns:', stats.totalAuthenticity);
    console.log('  Data Source:', stats.dataSource);
    console.log('  Academic Verification:', stats.verification);
    console.log('  Regional Coverage:', stats.subcorpora.join(', '));
    
    console.log('✅ AAPCAppE cultural processing completed successfully!');
  } else {
    console.log('❌ Cultural processing failed');
    process.exit(1);
  }
}

main().catch(console.error);
"

# Step 3: Update Ms. Jarvis brain with AAPCAppE integration
echo "🔄 Step 3: Integrating AAPCAppE data into Ms. Jarvis brain..."

# Create AAPCAppE integration module for brain.js
cat > backendlib/cultural-integration/aapcappe-integration.js << 'EOF'
// backendlib/cultural-integration/aapcappe-integration.js - AAPCAppE Integration Module
const { AAPCAppECulturalProcessor } = require('./aapcappe-processor.js');

class AAPCAppEIntegration {
  constructor() {
    this.processor = new AAPCAppECulturalProcessor();
    this.isLoaded = false;
  }

  async initialize() {
    try {
      const dataPath = './data/aapcappe-corpus';
      const success = await this.processor.loadAAPCAppEData(dataPath);
      
      if (success) {
        this.isLoaded = true;
        console.log('🏔️ AAPCAppE cultural integration initialized');
      }
      
      return success;
    } catch (error) {
      console.error('❌ AAPCAppE initialization error:', error.message);
      return false;
    }
  }

  enhanceSpecialistPrompt(specialistType, basePrompt) {
    if (!this.isLoaded) return basePrompt;
    
    const culturalEnhancement = this.processor.generateCulturalPromptEnhancement(specialistType);
    return basePrompt + '\n\n' + culturalEnhancement;
  }

  enhanceResponse(response, originalMessage) {
    if (!this.isLoaded) return response;
    
    return this.processor.enhanceResponseWithAuthenticity(response, originalMessage);
  }

  getCulturalStatistics() {
    return this.processor.getCulturalStatistics();
  }
}

module.exports = { AAPCAppEIntegration };
EOF

echo "📄 AAPCAppE integration module created successfully"

# Step 4: Deploy enhanced system
echo "🚀 Step 4: Deploying enhanced system with AAPCAppE integration..."
vercel --prod --force

echo "✅ Complete AAPCAppE integration workflow completed successfully!"
echo "🏔️ Ms. Jarvis now has access to authentic Appalachian cultural intelligence"
echo "📊 based on 1 million words of verified academic corpus research"
