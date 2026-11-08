const path = require('node:path');
const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { checkDatabase, pool } = require('./db/pool');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const dashboardRoutes = require('./routes/dashboard');
const itemRoutes = require('./routes/items');
const meRoutes = require('./routes/me');

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/health', async (_request, response) => {
  const databaseConfigured = Boolean(process.env.DB_HOST && process.env.DB_NAME);
  if (!databaseConfigured) {
    return response.json({ status: 'ok', service: 'seenit-api', database: 'not_configured' });
  }
  try {
    await checkDatabase();
    return response.json({ status: 'ok', service: 'seenit-api', database: 'connected' });
  } catch (_error) {
    return response.status(503).json({ status: 'error', service: 'seenit-api', database: 'unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/me', meRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

app.use((request, response) => {
  response.status(404).json({ error: 'Not found', path: request.originalUrl });
});

app.use((error, _request, response, _next) => {
  console.error('API error:', error.message);
  response.status(error.status || 500).json({
    error: error.status ? error.message : 'Internal server error',
  });
});

const server = app.listen(port, () => {
  console.log(`SEENIT API listening on http://localhost:${port}`);
});

function closeGracefully(signal) {
  console.log(`${signal} received; closing API server.`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));
