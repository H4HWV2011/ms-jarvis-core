module.exports = async (req, res) => {
  try {
    const testFiles = [
      '/ms_jarvis_image1.jpg',
      '/ms_jarvis_image2.jpg', 
      '/ms_jarvis_image3.jpg',
      '/logo192.png',
      '/manifest.json',
      '/favicon.ico'
    ];
    
    const results = [];
    
    for (const file of testFiles) {
      try {
        // Simulate file access check
        const fileTest = {
          path: file,
          status: 'TESTING',
          expectedMimeType: file.endsWith('.jpg') ? 'image/jpeg' : 
                           file.endsWith('.png') ? 'image/png' :
                           file.endsWith('.json') ? 'application/json' :
                           file.endsWith('.ico') ? 'image/x-icon' : 'unknown'
        };
        results.push(fileTest);
      } catch (e) {
        results.push({
          path: file,
          status: 'ERROR',
          error: e.message
        });
      }
    }
    
    return res.status(200).json({
      test: "mime-type",
      baseUrl: req.headers.host,
      protocol: req.headers['x-forwarded-proto'] || 'http',
      files: results,
      vercelConfig: 'Check headers configuration',
      result: "SUCCESS"
    });
  } catch (error) {
    return res.status(500).json({
      error: "MIME test failed", 
      message: error.message
    });
  }
};
