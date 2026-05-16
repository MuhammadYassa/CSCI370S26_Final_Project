const mysql = require('mysql2/promise');

let pool;

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: getRequiredEnv('DB_HOST'),
      port: Number(process.env.DB_PORT || 3306),
      database: getRequiredEnv('DB_NAME'),
      user: getRequiredEnv('DB_USER'),
      password: getRequiredEnv('DB_PASSWORD'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  return pool;
}

async function testConnection() {
  const connection = await getPool().getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

module.exports = {
  getPool,
  testConnection
};
