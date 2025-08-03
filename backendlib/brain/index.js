// Main entry point for Ms. Jarvis Brain
console.log("[DEBUG] Entered backendlib/brain/index.js");
const mother = require('./mother/mother');
module.exports = {
  converse: mother.converse
};
