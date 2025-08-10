let functionStartTime = Date.now();
let requestCounter = 0;

module.exports = async (req, res) => {
  const requestStartTime = Date.now();
  requestCounter++;
  
  try {
    const timeSinceStart = requestStartTime - functionStartTime;
    const isColdStart = requestCounter === 1;
    
    return res.status(200).json({
      test: "cold-start",
      requestNumber: requestCounter,
      isColdStart: isColdStart,
      timeSinceFunctionStart: `${timeSinceStart}ms`,
      requestStartTime: new Date(requestStartTime).toISOString(),
      functionStartTime: new Date(functionStartTime).toISOString(),
      result: "SUCCESS"
    });
  } catch (error) {
    return res.status(500).json({
      error: "Cold start test failed",
      message: error.message
    });
  }
};
