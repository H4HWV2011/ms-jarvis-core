export default async function handler(req, res) {
  try {
    console.log('🔧 Simple test endpoint called');
    
    const API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyAxycmbfMQutUncLixGMObIH52o_PxO3b8';
    const MODEL = process.env.LLM_MODEL || 'gemini-1.5-flash-8b';
    
    console.log('🔧 Using model:', MODEL);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: "Hello from Mount Hope, WV! Please respond with a simple greeting." }] 
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🚨 API Error:', errorText);
      return res.status(400).json({ 
        error: errorText, 
        model: MODEL,
        status: response.status 
      });
    }

    const data = await response.json();
    res.json({
      success: true,
      reply: data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response',
      model: MODEL,
      apiStatus: 'working'
    });
  } catch (error) {
    console.error('🚨 Handler Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
