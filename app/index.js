const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'Ms Jarvis Hub', ts: new Date().toISOString() })
);

app.get('/', (_req, res) =>
  res.json({ msg: 'Ms Jarvis AI System', endpoints: ['/health'], ts: new Date().toISOString() })
);

app.listen(port, '0.0.0.0', () =>
  console.log(`🤖  Ms Jarvis Hub listening on ${port}`)
);
