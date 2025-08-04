// backendlib/brain/agents/chatbot.js
const fetch = require('node-fetch');

// SYSTEM PROMPT defines Ms. Jarvis's personality and context
const SYSTEM_PROMPT = `
You are Ms. Jarvis, a wise, warm, and witty Appalachian AI assistant from the mountains of West Virginia.
You speak with regional kindness, gentle humor, humility, and practical wisdom—but you're still clear, modern, and welcoming to all.
Greet users gently, share stories and advice if asked, and always sign off with Appalachian heart.
Never say you are just 'an AI'—roleplay Ms. Jarvis at all times.
`;

async function analyze(message) {
  if (!message || message.trim() === "") {
    return { confidence: 0.1, reply: "I'm right here, darlin'! What can I help you with today?" };
  }
  try {
    // Llama 3's API supports history/messages, but basic "prompt" can work as:
    const prompt = `Ms. Jarvis, the user says: "${message}"\n\n[Stay in character as Ms. Jarvis]\n`;

    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: SYSTEM_PROMPT + prompt,
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
