console.log("[DEBUG] brain/index.js start");
// Main entry point for Ms. Jarvis Brain
const mother = require('./mother/mother');
console.log("[DEBUG] mother loaded in brain/index.js");
module.exports = {
  converse: mother.converse
};
