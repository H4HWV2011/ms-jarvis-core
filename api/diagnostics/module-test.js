let importResults = {};

try {
  // Test Node.js built-in modules
  importResults.path = require('path') ? 'SUCCESS' : 'FAILED';
} catch (e) {
  importResults.path = `FAILED: ${e.message}`;
}

try {
  // Test your brain module
  importResults.brain = require('../../backendlib/brain') ? 'SUCCESS' : 'FAILED';
} catch (e) {
  importResults.brain = `FAILED: ${e.message}`;
}

try {
  // Test other dependencies
  importResults.fs = require('fs') ? 'SUCCESS' : 'FAILED';
} catch (e) {
  importResults.fs = `FAILED: ${e.message}`;
}

module.exports = async (req, res) => {
  try {
    return res.status(200).json({
      test: "module-imports",
      importResults: importResults,
      nodeVersion: process.version,
      platform: process.platform,
      result: "SUCCESS"
    });
  } catch (error) {
    return res.status(500).json({
      error: "Module test failed",
      message: error.message
    });
  }
};
