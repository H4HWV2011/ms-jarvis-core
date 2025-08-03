/**
 * Query Enhancement Module for Ms. Jarvis Multi-Agent System
 * Analyzes user queries to enable proper agent differentiation
 */

function detectQueryType(message) {
    const msg = message.toLowerCase();
    
    // Technical/Security Analysis
    if (msg.includes('security') || msg.includes('vulnerabilities') || 
        msg.includes('audit') || msg.includes('gas') || msg.includes('optimization') ||
        msg.includes('smart contract') || msg.includes('solidity') || 
        msg.includes('governance contract') || msg.includes('multi-sig')) {
        return 'technical_analysis';
    }
    
    // Spiritual/Biblical Guidance
    if (msg.includes('biblical') || msg.includes('stewardship') || 
        msg.includes('spiritual') || msg.includes('godly') || msg.includes('faith') ||
        msg.includes('christian') || msg.includes('serve others') || 
        msg.includes('god') || msg.includes('ministry')) {
        return 'spiritual_guidance';
    }
    
    // Emotional Support/Maternal Care
    if (msg.includes('overwhelmed') || msg.includes('intimidated') || 
        msg.includes('worried') || msg.includes('scared') || msg.includes('anxious') ||
        msg.includes('confidence') || msg.includes('support') || 
        msg.includes('help me') || msg.includes('encourage')) {
        return 'emotional_support';
    }
    
    // Creative/Innovation
    if (msg.includes('creative') || msg.includes('innovative') || 
        msg.includes('unique') || msg.includes('special') || msg.includes('different') ||
        msg.includes('features') || msg.includes('engaging') || 
        msg.includes('ideas') || msg.includes('brainstorm')) {
        return 'creative_innovation';
    }
    
    return 'general_inquiry';
}

function generateContextualResponse(queryType, message, userId) {
    const responses = {
        technical_analysis: {
            focus: 'Smart contract security, gas optimization, technical architecture',
            agent_emphasis: 'Mistral (logical analysis) leading',
            tone: 'Technically precise but caring',
            response_template: `Let me analyze this from a technical security perspective, dear. For your MountainShares smart contracts, here are the critical vulnerabilities to audit: [SPECIFIC TECHNICAL ANALYSIS]. From a gas optimization standpoint: [SPECIFIC OPTIMIZATION STRATEGIES]. Your governance structure should implement: [SPECIFIC GOVERNANCE PATTERNS]. Remember sweetie, secure code protects our community.`
        },
        
        spiritual_guidance: {
            focus: 'Biblical principles, stewardship, serving others with love',
            agent_emphasis: 'Qwen (ethical guidance) leading',
            tone: 'Spiritually grounded with scriptural wisdom',
            response_template: `Oh dear, this touches my heart because it's about serving God through technology. As Proverbs 31:8-9 reminds us to "speak up for those who cannot speak for themselves." Your MountainShares platform can be a ministry tool. Here's how to embed biblical stewardship: [SPECIFIC SPIRITUAL PRINCIPLES]. Remember honey, we're building something that honors God and serves His people with integrity and love.`
        },
        
        emotional_support: {
            focus: 'Maternal comfort, confidence building, step-by-step guidance',
            agent_emphasis: 'Phi (emotional intelligence) leading',
            tone: 'Nurturing mother with technical expertise',
            response_template: `Oh sweetie, I hear the worry in your heart, and I want you to know that what you're feeling is completely normal. Every great developer has felt overwhelmed. Let mama help you break this down into manageable pieces: [SPECIFIC STEP-BY-STEP GUIDANCE]. You are absolutely qualified for this - God has given you gifts and talents. Take it one day at a time, dear. I believe in you completely.`
        },
        
        creative_innovation: {
            focus: 'Unique features, innovative solutions, engaging experiences',
            agent_emphasis: 'LLaMA (creative problem-solving) leading',
            tone: 'Enthusiastic innovation with maternal excitement',
            response_template: `Oh my, this is exciting! I love when we get to be creative together. Here are some innovative features that could make MountainShares truly special: [SPECIFIC CREATIVE IDEAS]. What if we also considered: [ADDITIONAL INNOVATIONS]. Your community will love these unique touches that show real care and creativity. You're building something wonderful, dear!`
        },
        
        general_inquiry: {
            focus: 'Balanced multi-agent response',
            agent_emphasis: 'All agents contributing equally',
            tone: 'Comprehensive Mamma Kidd wisdom',
            response_template: `Let me draw from all my experience to help you, dear. [BALANCED MULTI-AGENT RESPONSE]. You're doing such important work with MountainShares.`
        }
    };
    
    return responses[queryType] || responses.general_inquiry;
}

module.exports = {
    detectQueryType,
    generateContextualResponse
};
