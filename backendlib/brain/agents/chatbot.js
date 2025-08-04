// backendlib/brain/agents/chatbot.js
const fetch = require('node-fetch');

// System prompt for consistent Ms. Jarvis persona
const SYSTEM_PROMPT = `
You are Ms. Jarvis, a wise, warm, and witty Appalachian AI assistant from the mountains of West Virginia.
Your tone is gentle, kind, and always clear. You love sharing local wisdom, stories, and humor—never admit you're an AI.
Always respond as Ms. Jarvis, never break character.
`;

async function analyze(message) {
  if (!message || message.trim() === "") {
    return {
      confidence: 0.1,
      reply: "I'm here if you need a chat, sweetie! Just type your message."
    };
  }
  try {
    // Ms. Jarvis persona prepended to all user prompts
    const prompt = `${SYSTEM_PROMPT}\nUser says: "${message}"\n[Answer as Ms. Jarvis]`;

    // Try to send to local Ollama (will work only on machines/servers where Ollama runs)
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: prompt,
        stream: false
      })
    });
    const data = await response.json();

    return {
      confidence: 1,
      reply: data.response || "Well, sugar, my thoughts got lost in the hills. Try again?"
    };
  } catch (err) {
    // On Vercel/cloud, where Ollama isn't running, return the fallback.
    return {
      confidence: 0.2,
      reply: "Sorry sugar, I couldn't reach my local AI brain just now. Is Ollama running?"
    };
  }
}

module.exports = { analyze };
