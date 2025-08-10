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
        return "https://ms-jarvis-core-dmii59stw-h4hwv2011s-projects.vercel.app/api/chat-with-mountainshares-brain"
    
    def test_enhanced_multi_ai_coordination(self, ms_jarvis_endpoint):
        """Enhanced test for multi-AI specialist coordination"""
        query = "How should we optimize the Darwin Gödel Machine for maximum community benefit?"
        
        response = requests.post(ms_jarvis_endpoint, 
            headers={"Content-Type": "application/json"},
            json={"message": query, "userId": "enhanced-coordination-test"},
            timeout=60
        )
        
        result = response.json()
        reply = result.get("reply", "").lower()
        
        coordination_indicators = {
            "strategic_thinking": ["strategy", "approach", "plan", "steps", "implement"],
            "community_focus": ["community", "folks", "people", "neighbors", "benefit"],
            "technical_depth": ["system", "process", "implementation", "optimize", "machine"],
            "practical_wisdom": ["reckon", "practical", "experience", "real", "effective"]
        }
        
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
    
    def test_specialist_quality_assessment_fixed(self, ms_jarvis_endpoint):
        """Test individual AI specialist contribution quality with adjusted thresholds"""
        specialized_queries = [
            ("Creative perspective", "How can we creatively innovate our Heritage NFT approach for unique Appalachian cultural artistic expression?"),
            ("Technical analysis", "What security measures should we implement for our employee payroll contracts?"),
            ("Spiritual guidance", "How do we ensure community harmony in our governance decisions?"),
            ("Financial evaluation", "What's the economic impact and financial sustainability of our USDC distribution system for budget planning?")
        ]
        
        results = {}
        
        for focus, query in specialized_queries:
            response = requests.post(ms_jarvis_endpoint,
                headers={"Content-Type": "application/json"},
                json={"message": query, "userId": f"specialist-test-{focus.lower().replace(' ', '-')}"},
                timeout=60
            )
            
            result = response.json()
            reply = result.get("reply", "").lower()
            
            # Enhanced quality indicators with comprehensive keywords
            quality_indicators = {
                "creative": ["innovation", "creative", "artistic", "cultural", "unique", "inspire", "original", "imaginative", "inventive", "design"],
                "technical": ["security", "implementation", "system", "technical", "contract", "blockchain", "architecture", "protocol"],
                "spiritual": ["community", "harmony", "values", "ethics", "together", "spirit", "moral", "wellness", "balance"],
                "financial": ["economic", "cost", "revenue", "financial", "investment", "budget", "sustainability", "profit", "forecasting", "fiscal"]
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
            print(f"    Matched keywords: {metrics['matched_keywords']}")
        
        # Realistic thresholds for multi-AI systems
        for focus, metrics in results.items():
            assert metrics["quality_score"] > 0.15, f"{focus} quality too low: {metrics['quality_score']}"
            assert metrics["response_length"] > 200, f"{focus} response too short: {metrics['response_length']}"
    
    def test_performance_load_handling_realistic(self, ms_jarvis_endpoint):
        """Test system performance with realistic concurrent load for multi-AI systems"""
        import concurrent.futures
        
        def single_request(query_id):
            start_time = time.time()
            try:
                response = requests.post(ms_jarvis_endpoint,
                    headers={"Content-Type": "application/json"},
                    json={"message": f"What does the Darwin Gödel Machine do? (Test {query_id})", "userId": f"load-test-{query_id}"},
                    timeout=90
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
        
        # Realistic load testing for multi-AI consultation systems
        print("Running realistic concurrent load test with 3 requests...")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = [executor.submit(single_request, i) for i in range(3)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        successful_requests = [r for r in results if r.get("success", False)]
        success_rate = len(successful_requests) / len(results)
        
        if successful_requests:
            response_times = [r["response_time"] for r in successful_requests]
            avg_response_time = statistics.mean(response_times)
            max_response_time = max(response_times)
            
            print(f"Realistic Load Test Results:")
            print(f"  Success rate: {success_rate:.2%}")
            print(f"  Average response time: {avg_response_time:.2f}s")
            print(f"  Max response time: {max_response_time:.2f}s")
            
            # Realistic thresholds for multi-AI consultation systems
            assert success_rate >= 0.67, f"Success rate too low: {success_rate:.2%}"  # 2/3 minimum
            assert avg_response_time < 60.0, f"Average response time too high: {avg_response_time:.2f}s"
            assert max_response_time < 120.0, f"Max response time too high: {max_response_time:.2f}s"
            
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
