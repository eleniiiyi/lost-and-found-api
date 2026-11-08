require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lost_and_found',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true, // return DATETIME as plain strings (no timezone shifts)
});

module.exports = pool;
