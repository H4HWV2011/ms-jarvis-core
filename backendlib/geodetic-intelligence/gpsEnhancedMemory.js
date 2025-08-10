// gpsEnhancedMemory.js -- minimal stub to let MsJarvis boot

module.exports = {
  // Retrieve location-relevant memories
  retrieveLocationRelevantMemories: function(userId, message, userLocation, limit) {
    // For now, just return an empty array (fill in with real logic when ready!)
    return [];
  },

  // Return dummy memory stats
  getMemoryStats: function(userId) {
    return {};
  },

  // Store a memory (no-op for now)
  storeMemory: function(userId, message, response, meta, location) {
    // You can add logging here if needed, but right now just a stub
  }
};
