const serverless = require('serverless-http');
const app = require('../backendlib/app');

module.exports = serverless(app);
