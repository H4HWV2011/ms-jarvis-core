#!/bin/bash
echo "🏔️ Ms. Jarvis Frontend Health Check - Mount Hope, WV"
echo "=================================================="

echo "1. Testing main page load..."
if curl -s -I https://ms.jarvis.mountainshares.us/ | grep -q "HTTP/2 200"; then
    echo "✅ Main page loads successfully"
else
    echo "❌ Main page failed to load"
fi

echo "2. Testing static assets..."
for asset in ms_jarvis_image1.jpg ms_jarvis_image2.jpg manifest.json; do
    if curl -s -I https://ms.jarvis.mountainshares.us/$asset | grep -q "HTTP/2 200"; then
        echo "✅ $asset loads successfully"
    else
        echo "❌ $asset failed to load"
    fi
done

echo "3. Testing backend integration..."
RESPONSE=$(curl -s -X POST https://ms-jarvis-core-5kxltaigt-ms-jarvis.vercel.app/api/chat-with-mountainshares-brain \
  -H "Content-Type: application/json" \
  -H "Origin: https://ms.jarvis.mountainshares.us" \
  -d '{"message": "Frontend health check", "userId": "health_test"}' | jq -r '.processingMode')

if [ "$RESPONSE" = "full_ai_brain_with_cultural_intelligence" ]; then
    echo "✅ Backend integration working perfectly"
else
    echo "❌ Backend integration issue: $RESPONSE"
fi

echo "4. Frontend-Backend health check complete!"
