// utils/dynamic-cors.js
// Dynamic CORS configuration for Ms. Jarvis platform

const getPort = require('get-port');

class DynamicCORS {
  constructor() {
    this.allowedOrigins = new Set();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Static origins (production URLs)
    const staticOrigins = [
      'https://ms-jarvis-frontend-pink.vercel.app',
      'https://ms.jarvis.mountainshares.us',
      'https://ms-jarvis-core-ruddy.vercel.app',
      'https://ms-jarvis-frontend-xzifzfhdc-h4hwv2011s-projects.vercel.app',
      'https://ms-jarvis-core-oyjv722u9-ms-jarvis.vercel.app',
      'https://ms-jarvis-frontend-jh3d2y03z-h4hwv2011s-projects.vercel.app'
    ];

    staticOrigins.forEach(origin => this.allowedOrigins.add(origin));

    // Dynamic local development origins
    const localPorts = await this.findLocalPorts();
    localPorts.forEach(port => {
      this.allowedOrigins.add(`http://localhost:${port}`);
      this.allowedOrigins.add(`http://127.0.0.1:${port}`);
    });

    this.initialized = true;
    console.log('🌐 CORS origins initialized:', Array.from(this.allowedOrigins));
  }

  async findLocalPorts() {
    const basePorts = [3000, 3001, 3002, 3003, 8000, 8080, 5000, 5173, 4000];
    const availablePorts = [];

    for (const basePort of basePorts) {
      try {
        const port = await getPort({
          port: basePort
        });
        availablePorts.push(port);
        
        // Also check nearby ports
        for (let i = 1; i <= 3; i++) {
          try {
            const nearbyPort = await getPort({
              port: basePort + i
            });
            availablePorts.push(nearbyPort);
          } catch (error) {
            // Port not available, continue
          }
        }
      } catch (error) {
        console.log(`Port ${basePort} range not available`);
      }
    }

    console.log('🔍 Found available local ports:', availablePorts);
    return availablePorts;
  }

  async isOriginAllowed(origin) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    return this.allowedOrigins.has(origin);
  }

  async getAllowedOrigins() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    return Array.from(this.allowedOrigins);
  }
}

module.exports = new DynamicCORS();
