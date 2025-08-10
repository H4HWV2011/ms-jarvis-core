// utils/native-port-finder.js
// Native Node.js port detection utility

const net = require('net');

class NativePortFinder {
  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.listen(port, () => {
        server.once('close', () => {
          resolve(true); // Port is available
        });
        server.close();
      });
      
      server.on('error', () => {
        resolve(false); // Port is not available
      });
    });
  }

  async findOpenPort(startPort = 3000, maxPort = 3020) {
    for (let port = startPort; port <= maxPort; port++) {
      if (await this.isPortAvailable(port)) {
        console.log(`✅ Found open port: ${port}`);
        return port;
      }
    }
    
    console.log('⚠️ No open ports found in range, returning default');
    return startPort; // Fallback
  }

  async generateLocalOrigins(startPort = 3000, count = 5) {
    const origins = [];
    let currentPort = startPort;
    
    for (let i = 0; i < count; i++) {
      const port = await this.findOpenPort(currentPort, currentPort + 10);
      origins.push(`http://localhost:${port}`);
      currentPort = port + 1;
    }
    
    console.log('🌐 Generated local origins:', origins);
    return origins;
  }
}

module.exports = new NativePortFinder();

