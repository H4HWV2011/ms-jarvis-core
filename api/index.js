const app = require('./app/app');
const serverless = require('serverless-http');
module.exports = serverless(app);
