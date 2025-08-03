module.exports = {
  converse: async (message, userId) => ({
    reply: `Echo: ${message}`,
    agent: "Mother",
    time: Date.now()
  })
};
