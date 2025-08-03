const serverless = require('serverless-http');
const app = require('../../backendlib/app'); // update path if api/ is at root, or use '../backendlib/app'

module.exports = serverless(app);
