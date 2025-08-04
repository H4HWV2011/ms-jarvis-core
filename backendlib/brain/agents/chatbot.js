// backendlib/brain/agents/chatbot.js
const fetch = require('node-fetch');

async function analyze(message) {
  if (!message || message.trim() === "") {
    return { confidence: 0.1, reply: "I'm always here if you want to chat, sweetie!" };
  }
  try {
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: message,
        stream: false
      })
    });
    const data = await response.json();
    return {
      confidence: 1,
      reply: data.response || "I'm here for you, but didn't get a response from my local brain."
    };
  } catch (err) {
    return {
      confidence: 0.2,
      reply: "Sorry sugar, I couldn't reach my local AI brain just now. Is Ollama running?"
    };
  }
}
module.exports = { analyze };
