const path = require('node:path');
const express = require('express');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'seenit-api' });
});

app.use((request, response) => {
  response.status(404).json({
    error: 'Not found',
    path: request.originalUrl,
  });
});

app.listen(port, () => {
  console.log(`SEENIT API listening on http://localhost:${port}`);
});
