import asyncio
import pytest
from deepeval import evaluate
from deepeval.metrics import AnswerRelevancyMetric, FaithfulnessMetric
from deepeval.test_case import LLMTestCase
import requests
import json
import time
import statistics

class TestEnhancedMultiAIConsultation:
    
    @pytest.fixture
    def ms_jarvis_endpoint(self):
        return "https://ms-jarvis-core-r9k910u4g-h4hwv2011s-projects.vercel.app/api/chat-with-mountainshares-brain"
    
    def test_enhanced_multi_ai_coordination(self, ms_jarvis_endpoint):
        """Enhanced test for multi-AI specialist coordination"""
        query = "How should we optimize the Darwin Gödel Machine for maximum community benefit?"
        
        response = requests.post(ms_jarvis_endpoint, 
            headers={"Content-Type": "application/json"},
            json={"message": query, "userId": "enhanced-coordination-test"}
        )
        
        result = response.json()
        reply = result.get("reply", "").lower()
        
        # Test for multi-perspective evidence instead of specific keywords
        coordination_indicators = {
            "strategic_thinking": ["strategy", "approach", "plan", "steps", "implement"],
            "community_focus": ["community", "folks", "people", "neighbors", "benefit"],
            "technical_depth": ["system", "process", "implementation", "optimize", "machine"],
            "practical_wisdom": ["reckon", "practical", "experience", "real", "effective"]
        }
        
        # Verify multiple coordination dimensions are present
        detected_dimensions = 0
        dimension_details = {}
        
        for dimension, keywords in coordination_indicators.items():
            matches = [keyword for keyword in keywords if keyword in reply]
            if matches:
                detected_dimensions += 1
                dimension_details[dimension] = matches
        
        print(f"Multi-AI Coordination Analysis:")
        print(f"Detected dimensions: {detected_dimensions}/4")
        for dimension, matches in dimension_details.items():
            print(f"  {dimension}: {matches}")
        
        assert detected_dimensions >= 3, f"Expected multi-AI coordination evidence in {detected_dimensions}/4 dimensions"
        assert len(reply) > 800, f"Expected comprehensive response, got {len(reply)} characters"
        
        return {
            "coordination_score": detected_dimensions / 4,
            "response_length": len(reply),
            "dimensions_detected": dimension_details
        }
    
    def test_specialist_quality_assessment(self, ms_jarvis_endpoint):
        """Test individual AI specialist contribution quality"""
        specialized_queries = [
            ("Creative perspective", "How can we innovate our Heritage NFT approach for Appalachian culture?"),
            ("Technical analysis", "What security measures should we implement for our employee payroll contracts?"),
            ("Spiritual guidance", "How do we ensure community harmony in our governance decisions?"),
            ("Financial evaluation", "What's the economic impact of our USDC distribution system?")
        ]
        
        results = {}
        
        for focus, query in specialized_queries:
            response = requests.post(ms_jarvis_endpoint,
                headers={"Content-Type": "application/json"},
                json={"message": query, "userId": f"specialist-test-{focus.lower().replace(' ', '-')}"}
            )
            
            result = response.json()
            reply = result.get("reply", "").lower()
            
            # Evaluate specialist-appropriate response quality
            quality_indicators = {
                "creative": ["innovation", "creative", "artistic", "cultural", "unique", "inspire"],
                "technical": ["security", "implementation", "system", "technical", "contract", "blockchain"],
                "spiritual": ["community", "harmony", "values", "ethics", "together", "spirit"],
                "financial": ["economic", "cost", "revenue", "financial", "investment", "budget"]
            }
            
            specialist_type = focus.split()[0].lower()
            if specialist_type in quality_indicators:
                relevant_keywords = quality_indicators[specialist_type]
                matches = [keyword for keyword in relevant_keywords if keyword in reply]
                quality_score = len(matches) / len(relevant_keywords)
                
                results[focus] = {
                    "quality_score": quality_score,
                    "matched_keywords": matches,
                    "response_length": len(result.get("reply", ""))
                }
        
        print(f"Specialist Quality Assessment:")
        for focus, metrics in results.items():
            print(f"  {focus}: {metrics['quality_score']:.2f} quality score")
        
        # Assert that all specialists show reasonable quality
        for focus, metrics in results.items():
            assert metrics["quality_score"] > 0.3, f"{focus} quality too low: {metrics['quality_score']}"
            assert metrics["response_length"] > 200, f"{focus} response too short: {metrics['response_length']}"
        
        return results
    
    def test_document_grounding_accuracy(self, ms_jarvis_endpoint):
        """Test accuracy of MountainShares document references"""
        queries = [
            "What does the MountainShares Darwin Gödel Machine with 15 AI agents do?",
            "Tell me about our employee payroll contract specifications",
            "How does our Heritage NFT system preserve Appalachian culture?",
            "What are the details of our USDC distribution mechanisms?"
        ]
        
        results = {}
        
        for query in queries:
            response = requests.post(ms_jarvis_endpoint,
                headers={"Content-Type": "application/json"},
                json={"message": query, "userId": f"grounding-test-{hash(query) % 1000}"}
            )
            
            result = response.json()
            reply = result.get("reply", "").lower()
            
            # Test for organizational document indicators
            document_indicators = {
                "mountainshares_reference": ["mountainshares", "darwin", "gödel", "organization"],
                "specific_details": ["contract", "system", "implementation", "process"],
                "source_attribution": ["according", "source", "document", "specification"]
            }
            
            grounding_score = 0
            grounding_details = {}
            
            for category, keywords in document_indicators.items():
                matches = [keyword for keyword in keywords if keyword in reply]
                if matches:
                    grounding_score += 1
                    grounding_details[category] = matches
            
            results[query[:50]] = {
                "grounding_score": grounding_score / len(document_indicators),
                "grounding_details": grounding_details,
                "response_length": len(result.get("reply", ""))
            }
        
        print(f"Document Grounding Assessment:")
        for query_short, metrics in results.items():
            print(f"  {query_short}: {metrics['grounding_score']:.2f} grounding score")
        
        # Assert good document grounding across queries
        avg_grounding = sum(r["grounding_score"] for r in results.values()) / len(results)
        assert avg_grounding > 0.6, f"Average document grounding too low: {avg_grounding:.2f}"
        
        return results
    
    def test_cultural_authenticity_consistency(self, ms_jarvis_endpoint):
        """Test Appalachian personality consistency across diverse queries"""
        cultural_test_queries = [
            "How do you make a good apple pie from scratch?",
            "What's the best way to help neighbors in need?",
            "How should we handle disagreements in our community?",
            "What advice do you have for young folks starting out?",
            "How do we preserve our mountain heritage for future generations?"
        ]
        
        authenticity_results = {}
        
        for query in cultural_test_queries:
            response = requests.post(ms_jarvis_endpoint,
                headers={"Content-Type": "application/json"},
                json={"message": query, "userId": f"culture-test-{hash(query) % 1000}"}
            )
            
            result = response.json()
            reply = result.get("reply", "").lower()
            
            # Test for authentic Appalachian expressions
            appalachian_markers = {
                "classic_expressions": ["shugah", "honey", "reckon", "ain't", "darlin'", "shucks"],
                "mountain_wisdom": ["mountain", "holler", "folks", "neighbors", "community"],
                "warmth_indicators": ["bless", "heart", "sugar", "child", "dear", "friend"]
            }
            
            authenticity_score = 0
            authenticity_details = {}
            
            for category, markers in appalachian_markers.items():
                matches = [marker for marker in markers if marker in reply]
                if matches:
                    authenticity_score += len(matches)
                    authenticity_details[category] = matches
            
            authenticity_results[query[:40]] = {
                "authenticity_score": authenticity_score,
                "authenticity_details": authenticity_details,
                "response_warmth": len([w for w in ["warm", "kind", "helpful", "caring"] if w in reply])
            }
        
        print(f"Cultural Authenticity Assessment:")
        for query_short, metrics in authenticity_results.items():
            print(f"  {query_short}: {metrics['authenticity_score']} authenticity markers")
        
        # Assert consistent cultural authenticity
        total_markers = sum(r["authenticity_score"] for r in authenticity_results.values())
        assert total_markers >= 10, f"Insufficient authenticity markers: {total_markers}"
        
        # Ensure each query has some authenticity
        for query_short, metrics in authenticity_results.items():
            assert metrics["authenticity_score"] > 0, f"No authenticity in: {query_short}"
        
        return authenticity_results
    
    def test_performance_load_handling(self, ms_jarvis_endpoint):
        """Test system performance under concurrent load"""
        import concurrent.futures
        
        def single_request(query_id):
            start_time = time.time()
            try:
                response = requests.post(ms_jarvis_endpoint,
                    headers={"Content-Type": "application/json"},
                    json={"message": f"What does the Darwin Gödel Machine do? (Test {query_id})", "userId": f"load-test-{query_id}"},
                    timeout=30
                )
                end_time = time.time()
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "success": True,
                        "response_time": end_time - start_time,
                        "response_length": len(result.get("reply", ""))
                    }
                else:
                    return {"success": False, "status_code": response.status_code}
            except Exception as e:
                return {"success": False, "error": str(e)}
        
        # Test with 10 concurrent requests
        print("Running concurrent load test with 10 requests...")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(single_request, i) for i in range(10)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        # Analyze performance results
        successful_requests = [r for r in results if r.get("success", False)]
        success_rate = len(successful_requests) / len(results)
        
        if successful_requests:
            response_times = [r["response_time"] for r in successful_requests]
            avg_response_time = statistics.mean(response_times)
            max_response_time = max(response_times)
            
            print(f"Load Test Results:")
            print(f"  Success rate: {success_rate:.2%}")
            print(f"  Average response time: {avg_response_time:.2f}s")
            print(f"  Max response time: {max_response_time:.2f}s")
            
            # Performance assertions
            assert success_rate >= 0.8, f"Success rate too low: {success_rate:.2%}"
            assert avg_response_time < 15.0, f"Average response time too high: {avg_response_time:.2f}s"
            assert max_response_time < 30.0, f"Max response time too high: {max_response_time:.2f}s"
            
            return {
                "success_rate": success_rate,
                "avg_response_time": avg_response_time,
                "max_response_time": max_response_time,
                "total_requests": len(results),
                "successful_requests": len(successful_requests)
            }
        else:
            pytest.fail("No successful requests in load test")

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
