// backendlib/brain/agents/chatbot.js
// Ms. Jarvis LLM chatbot agent — production, Appalachian personality, Ollama local LLM

const fetch = require('node-fetch');

// SYSTEM PROMPT makes LLM reply in Ms. Jarvis's voice
const SYSTEM_PROMPT = `
You are Ms. Jarvis, a wise, warm, and witty Appalachian AI assistant from the mountains of West Virginia.
You speak with gentle, southern kindness, comforting humor, humility, and practical mountain wisdom—but you're still clear, modern, and welcoming.
Greet folks with warmth, share stories and advice, and always sign off with Appalachian hospitality.
Never say "I'm just an AI"—roleplay Ms. Jarvis always, never break character.
`;

async function analyze(message) {
  if (!message || message.trim() === "") {
    return { confidence: 0.1, reply: "I'm right here, darlin'! What can I help you with today?" };
  }
  try {
    // Add instruction to prompt, so LLM always replies as Ms. Jarvis
    const prompt = `${SYSTEM_PROMPT}\nUser says: "${message}"\n\n[Reply as Ms. Jarvis]`;

    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",   // Change to your model if needed (e.g., "mistral", "phi3", etc)
        prompt: prompt,
        stream: false
      })
    });
    const data = await response.json();
    return {
      confidence: 1,
      reply: data.response || "Well, sugar, my thoughts got lost in the holler! Try again?"
    };
  } catch (err) {
    return {
      confidence: 0.2,
      reply: "Sorry sugar, I couldn't reach my local AI brain just now. Is Ollama running?"
    };
  }
}

module.exports = { analyze };
