import asyncio
import pytest
from deepeval import evaluate
from deepeval.metrics import AnswerRelevancyMetric, FaithfulnessMetric
from deepeval.test_case import LLMTestCase
import requests
import json

class TestMultiAIConsultation:
    
    @pytest.fixture
    def ms_jarvis_endpoint(self):
        return "https://ms-jarvis-core-r9k910u4g-h4hwv2011s-projects.vercel.app/api/chat-with-mountainshares-brain"
    
    def test_multi_ai_coordination(self, ms_jarvis_endpoint):
        """Test coordination between Creative, Technical, Spiritual, Financial AIs"""
        query = "How should we optimize the Darwin Gödel Machine for maximum community benefit?"
        
        response = requests.post(ms_jarvis_endpoint, 
            headers={"Content-Type": "application/json"},
            json={"message": query, "userId": "test-coordination"}
        )
        
        result = response.json()
        
        # Test multi-perspective integration
        assert "creative" in result.get("reply", "").lower() or "innovation" in result.get("reply", "").lower()
        assert "technical" in result.get("reply", "").lower() or "system" in result.get("reply", "").lower()
        assert "community" in result.get("reply", "").lower()
        assert len(result.get("reply", "")) > 500  # Comprehensive response expected
    
    def test_document_grounding_accuracy(self, ms_jarvis_endpoint):
        """Test accuracy of MountainShares document references"""
        query = "What does the MountainShares Darwin Gödel Machine with 15 AI agents do?"
        
        response = requests.post(ms_jarvis_endpoint,
            headers={"Content-Type": "application/json"},
            json={"message": query, "userId": "test-grounding"}
        )
        
        result = response.json()
        reply = result.get("reply", "")
        
        # Test for organizational document references
        assert "mountainshares" in reply.lower()
        assert "darwin" in reply.lower() and "gödel" in reply.lower()
        assert len(reply) > 300  # Substantial response expected
    
    def test_cultural_authenticity(self, ms_jarvis_endpoint):
        """Test Appalachian personality consistency"""
        queries = [
            "How do you make a good apple pie?",
            "What's the weather like in the mountains?",
            "How should we help our community?"
        ]
        
        for query in queries:
            response = requests.post(ms_jarvis_endpoint,
                headers={"Content-Type": "application/json"},
                json={"message": query, "userId": "test-culture"}
            )
            
            result = response.json()
            reply = result.get("reply", "").lower()
            
            # Test for Appalachian expressions
            appalachian_markers = ["shugah", "honey", "reckon", "ain't", "darlin'", "shucks"]
            assert any(marker in reply for marker in appalachian_markers)

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
