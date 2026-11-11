const mysql = require('mysql2/promise');

const databaseConfigured = Boolean(process.env.DB_HOST && process.env.DB_NAME);

function createDatabaseNotConfiguredError() {
  const error = new Error(
    'Database is not configured. Set DB_HOST and DB_NAME in server/.env to use database-backed features.',
  );
  error.status = 503;
  return error;
}

const pool = databaseConfigured
  ? mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    dateStrings: true,
  })
  : {
    query: async () => { throw createDatabaseNotConfiguredError(); },
    execute: async () => { throw createDatabaseNotConfiguredError(); },
    getConnection: async () => { throw createDatabaseNotConfiguredError(); },
    end: async () => {},
  };

async function checkDatabase() {
  if (!databaseConfigured) throw createDatabaseNotConfiguredError();
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

module.exports = { pool, checkDatabase, databaseConfigured };
