const { Pool, types } = require('pg');

// NUMERIC/DECIMAL columns return as strings by default to avoid precision loss.
// Since lat/lng/scores here don't need arbitrary precision, parse them as floats globally.
types.setTypeParser(1700, (val) => parseFloat(val)); // 1700 = NUMERIC/DECIMAL OID

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'YOUR_DB_PASSWORD',
  database: 'floodguard'
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error', err);
});

module.exports = pool;