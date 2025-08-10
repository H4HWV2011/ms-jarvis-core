module.exports = async (req, res) => {
  const testType = req.query.type || 'safe';
  
  try {
    switch (testType) {
      case 'safe':
        return res.status(200).json({
          test: "exception-safe",
          result: "SUCCESS"
        });
        
      case 'handled':
        try {
          throw new Error('Test handled exception');
        } catch (e) {
          return res.status(200).json({
            test: "exception-handled",
            caughtError: e.message,
            result: "SUCCESS"
          });
        }
        
      case 'timeout':
        // Test function timeout
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(res.status(200).json({
              test: "timeout-test",
              result: "SUCCESS"
            }));
          }, 10000); // 10 second delay
        });
        
      default:
        return res.status(400).json({
          error: "Invalid test type"
        });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Exception test failed",
      message: error.message,
      stack: error.stack
    });
  }
};

