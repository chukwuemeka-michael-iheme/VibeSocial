const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = fs.readFileSync('init.sql', 'utf8');

pool.connect(async (err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }

  try {
    await client.query(sql);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    release();
  }
});