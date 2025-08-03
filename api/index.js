const app = require('../backendlib/app');
const serverless = require('serverless-http');
module.exports = serverless(app);
