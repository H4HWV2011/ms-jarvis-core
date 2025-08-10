// Test memory and CPU limits
module.exports = async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Memory usage test
    const memoryUsage = process.memoryUsage();
    
    // CPU intensive test
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.random() * Math.random();
    }
    
    const endTime = Date.now();
    
    return res.status(200).json({
      test: "memory-cpu",
      memoryUsage: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
      },
      executionTime: `${endTime - startTime}ms`,
      result: "SUCCESS"
    });
  } catch (error) {
    return res.status(500).json({
      error: "Memory/CPU test failed",
      message: error.message,
      stack: error.stack
    });
  }
};
