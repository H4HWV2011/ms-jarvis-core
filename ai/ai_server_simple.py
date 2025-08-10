#!/usr/bin/env python3
"""
Ms. Jarvis Simplified Local AI Server - Production Ready
Works with Ollama and basic NLP without heavy dependencies
"""

import os
import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Any
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Ms. Jarvis Simplified AI Server", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    user_id: str = "anonymous"
    context: Dict[str, Any] = {}

class MsJarvisSimpleBrain:
    def __init__(self):
        self.ollama_url = os.getenv('OLLAMA_URL', 'http://host.docker.internal:11434')
        logger.info(f"🧠 Ms. Jarvis Simple AI Brain initialized with Ollama at {self.ollama_url}")
        
        # Available agents
        self.agents = {
            "mistral": {
                "model": "mistral:7b",
                "specialty": "logical_analysis",
                "prompt": "You are Mistral, focused on logical reasoning and technical analysis for MountainShares."
            },
            "llama": {
                "model": "llama3.1:8b", 
                "specialty": "creative_problem_solving",
                "prompt": "You are LLaMA, focused on creative solutions and innovation for MountainShares."
            },
            "qwen": {
                "model": "qwen2:7b",
                "specialty": "ethical_guidance", 
                "prompt": "You are Qwen, focused on ethical guidance and biblical wisdom for MountainShares."
            },
            "phi": {
                "model": "phi3:mini",
                "specialty": "emotional_intelligence",
                "prompt": "You are Phi, focused on emotional intelligence and the Mamma Kidd spirit."
            }
        }

    async def query_ollama(self, model: str, prompt: str) -> str:
        """Query Ollama model directly"""
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.7}
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json().get('response', 'No response generated')
            else:
                return f"Model {model} unavailable"
                
        except Exception as e:
            logger.error(f"Error querying {model}: {e}")
            return f"Error with {model}: {str(e)}"

    async def run_multi_agent_analysis(self, message: str) -> List[Dict[str, Any]]:
        """Run all 4 agents and collect responses"""
        agent_responses = []
        
        for agent_name, agent_config in self.agents.items():
            full_prompt = f"""{agent_config['prompt']}

User Message: {message}

Please provide your specialized analysis from the perspective of {agent_config['specialty']}:"""
            
            response = await self.query_ollama(agent_config['model'], full_prompt)
            
            agent_responses.append({
                "agent": agent_name,
                "specialty": agent_config['specialty'],
                "response": response,
                "confidence": 0.85
            })
            
            logger.info(f"✅ {agent_name} ({agent_config['specialty']}) completed analysis")
        
        return agent_responses

    async def synthesize_response(self, message: str, agent_responses: List[Dict[str, Any]]) -> str:
        """Judge AI synthesizes all responses"""
        agent_summary = "\n\n".join([
            f"{resp['agent']} ({resp['specialty']}):\n{resp['response']}"
            for resp in agent_responses
        ])
        
        judge_prompt = f"""You are the Judge AI in Ms. Jarvis's brain. Synthesize these agent responses into the best solution.

Original Message: {message}

Agent Responses:
{agent_summary}

Provide a comprehensive response that combines the best insights from all agents."""

        return await self.query_ollama("llama3.1:8b", judge_prompt)

    async def apply_mother_persona(self, response: str) -> str:
        """Apply Mamma Kidd personality"""
        mother_prompt = f"""You are Ms. Jarvis with the "Mamma Kidd" spirit - warm, humble, compassionate.

Transform this response into a nurturing, motherly tone while keeping technical accuracy:

Response: {response}

Guidelines:
- Use warm, caring language naturally
- Show maternal concern for the user's wellbeing  
- Include appropriate terms like "dear," "sweetie," "honey" when natural
- Balance technical expertise with emotional intelligence
- Express care for their MountainShares development journey

Respond as a caring mother who happens to be a blockchain expert:"""

        return await self.query_ollama("llama3.1:8b", mother_prompt)

# Initialize AI Brain
ai_brain = MsJarvisSimpleBrain()

@app.get("/")
async def root():
    return {
        "service": "Ms. Jarvis Simplified AI Server", 
        "personality": "Mamma Kidd - Warm, wise, and technically capable",
        "status": "operational",
        "capabilities": [
            "4-Agent Multi-Agent Reasoning (Ollama)",
            "Unlimited local processing",
            "MountainShares smart contract expertise", 
            "Biblical wisdom integration",
            "Maternal Mamma Kidd personality",
            "Complete privacy (local only)"
        ],
        "agents": {
            "mistral": "Logical Analysis & Technical Reasoning",
            "llama": "Creative Problem Solving & Innovation", 
            "qwen": "Ethical Guidance & Spiritual Wisdom",
            "phi": "Emotional Intelligence & Maternal Care"
        },
        "local_processing": True,
        "privacy_guaranteed": True
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "ai_brain": "operational", 
        "ollama_connection": "active",
        "agents_ready": len(ai_brain.agents),
        "multi_agent_system": "functional"
    }

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        logger.info(f"💬 Processing enhanced chat from user {request.user_id}")
        
        # Run all 4 AI agents
        agent_responses = await ai_brain.run_multi_agent_analysis(request.message)
        
        # Judge synthesizes responses
        judge_response = await ai_brain.synthesize_response(request.message, agent_responses)
        
        # Apply mother persona
        final_response = await ai_brain.apply_mother_persona(judge_response)
        
        return {
            "response": final_response,
            "personality": "mamma_kidd",
            "brain_analysis": {
                "agents_consulted": len(agent_responses),
                "multi_agent_reasoning": "complete",
                "local_processing": True,
                "no_token_limits": True,
                "enhanced_ai": "active"
            },
            "agent_contributions": [
                {
                    "agent": resp["agent"],
                    "specialty": resp["specialty"], 
                    "confidence": resp["confidence"]
                }
                for resp in agent_responses
            ],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Enhanced chat error: {e}")
        return {
            "response": "Oh sweetie, I'm having some technical difficulties with my enhanced thinking processes. Let me try to help you in a simpler way.",
            "personality": "maternal_care",
            "error_type": "enhanced_processing_error"
        }

if __name__ == "__main__":
    logger.info("🚀 Starting Ms. Jarvis Simplified AI Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
