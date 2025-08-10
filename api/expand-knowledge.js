// api/expand-knowledge.js - API for expanding Ms. Jarvis knowledge
const { ContinuousLearningEngine } = require('../backendlib/continuous-learning');

let learningEngine;

export default async function handler(req, res) {
  // Initialize learning engine if not already done
  if (!learningEngine) {
    learningEngine = new ContinuousLearningEngine();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, data } = req.body;

    switch (action) {
      case 'analyze_gaps':
        const analytics = learningEngine.getLearningAnalytics();
        const knowledgeGaps = Array.from(learningEngine.knowledgeGaps.entries());
        
        return res.status(200).json({
          analytics,
          gaps: knowledgeGaps.map(([key, gap]) => ({
            topic: gap.topic,
            category: gap.category,
            priority: gap.priority,
            occurrences: gap.occurrences.length,
            status: gap.learningStatus
          }))
        });

      case 'trigger_learning':
        if (!data.topic) {
          return res.status(400).json({ error: 'Topic required' });
        }
        
        // Manually trigger learning for a specific topic
        const gapInfo = {
          topic: data.topic,
          category: data.category || 'general',
          occurrences: [{ timestamp: Date.now() }],
          priority: data.priority || 5
        };
        
        await learningEngine.triggerKnowledgeLearning(gapInfo);
        
        return res.status(200).json({
          message: `Learning triggered for topic: ${data.topic}`,
          status: 'success'
        });

      case 'add_feedback':
        if (!data.userId || !data.interactionId || !data.feedback) {
          return res.status(400).json({ error: 'Missing required feedback data' });
        }
        
        // Add user feedback to improve learning
        const userInteractions = learningEngine.interactionHistory.get(data.userId) || [];
        const interaction = userInteractions.find(i => i.id === data.interactionId);
        
        if (interaction) {
          interaction.feedback = data.feedback;
          console.log(`📝 Feedback added for interaction: ${data.interactionId}`);
        }
        
        return res.status(200).json({
          message: 'Feedback added successfully',
          status: 'success'
        });

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }

  } catch (error) {
    console.error('Knowledge expansion error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
