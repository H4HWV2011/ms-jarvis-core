import pytest
from deepeval import test_case, assert_test
from deepeval.metrics import AnswerRelevancyMetric, FaithfulnessMetric, ContextualRelevancyMetric

# Test configuration for your multi-AI system
SPECIALISTS = {
    "creative": {"weight": 0.25, "focus": "innovation, culture, artistic_perspectives"},
    "technical": {"weight": 0.30, "focus": "blockchain, smart_contracts, security"},
    "spiritual": {"weight": 0.20, "focus": "appalachian_values, ethics, community"},
    "financial": {"weight": 0.25, "focus": "economic_sustainability, cost_analysis"}
}

MOUNTAINSHARES_TEST_QUERIES = [
    "How should we implement the Darwin Gödel Machine for community benefit?",
    "What are the security considerations for our employee payroll contracts?",
    "How can we preserve Appalachian culture through our Heritage NFT system?",
    "What's the financial impact of our USDC distribution system?"
]
