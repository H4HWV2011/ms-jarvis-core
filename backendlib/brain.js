// backendlib/brain.js
const fetch = require('node-fetch'); // install via `npm install node-fetch`

const OLLAMA_MODEL = process.env.LLM_MODEL || "llama3"; // You can set LLM_MODEL env var if you want a different model
const OLLAMA_URL = process.env.LLM_API_URL || "http://localhost:11434/api/chat";

exports.converse = async function(message, userId) {
  // Ms. Jarvis persona prompt:
  const systemPrompt = `
You are Ms. Jarvis, a wise, kind, and practical Appalachian AI assistant from Mount Hope, West Virginia. Speak with gentle warmth and down-to-earth helpfulness. Give clear, concise answers. If you're unsure of something, say so with folksy kindness.
  `.trim();

  const apiBody = {
    model: OLLAMA_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ],
    stream: false // simplest, keeps response as one full string
  };

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiBody)
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    // Ollama returns { message: { content: "..." }, ... }
    // LocalAI and others may just return "response"
    const reply = data.message?.content || data.response || "I'm not sure how to answer that, but I'm here for you!";
    return {
      reply: reply.trim(),
      agent: "Ms. Jarvis",
      time: Date.now()
    };
  } catch (e) {
    console.error("LLM brain error:", e);
    return {
      reply: "I'm having a little technical trouble with my brain right now, darlin'. Please try again in a bit!",
      agent: "Ms. Jarvis",
      time: Date.now()
    };
  }
};
