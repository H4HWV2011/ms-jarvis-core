// utils/port-finder.js
// Dynamic port detection utility for Ms. Jarvis platform

const getPort = require('get-port');

class PortFinder {
  constructor() {
    this.detectedPorts = new Set();
  }

  async findAvailablePort(preferredPort = 3000) {
    try {
      const port = await getPort({
        port: [preferredPort, preferredPort + 1, preferredPort + 2, preferredPort + 3, preferredPort + 4]
      });
      
      console.log(`🔍 Found available port: ${port}`);
      this.detectedPorts.add(port);
      return port;
    } catch (error) {
      console.error('Error finding available port:', error);
      return preferredPort; // Fallback to preferred port
    }
  }

  async generateLocalOrigins(basePort = 3000, count = 5) {
    const origins = [];
    
    for (let i = 0; i < count; i++) {
      const port = await getPort({
        port: basePort + i
      });
      origins.push(`http://localhost:${port}`);
    }
    
    console.log('🌐 Generated local origins:', origins);
    return origins;
  }

  getDetectedPorts() {
    return Array.from(this.detectedPorts);
  }
}

module.exports = new PortFinder();
