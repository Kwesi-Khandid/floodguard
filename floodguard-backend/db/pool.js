// const { Pool, types } = require('pg');

// // NUMERIC/DECIMAL columns return as strings by default to avoid precision loss.
// // Since lat/lng/scores here don't need arbitrary precision, parse them as floats globally.
// types.setTypeParser(1700, (val) => parseFloat(val)); // 1700 = NUMERIC/DECIMAL OID

// const pool = new Pool({
//   host: process.env.DBHOST,
//   port: process.env.DBPORT,
//   user: process.env.DBUSER,
//   password: process.env.DBPASSWORD,
//   database: process.env.DBNAME,

// });

// pool.on('error', (err) => {
//   console.error('Unexpected PostgreSQL error', err);
// });

// module.exports = pool;

const { Pool, types } = require('pg');

// Parse NUMERIC/DECIMAL columns as floats
types.setTypeParser(1700, (val) => parseFloat(val)); // OID 1700 = NUMERIC/DECIMAL

const pool = new Pool({
  host: process.env.DBHOST,
  port: Number(process.env.DBPORT) || 5432,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  database: process.env.DBNAME,
  // Required: Supabase requires SSL connections over public internet
  ssl: process.env.DBSSL === 'false' ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error', err);
});

module.exports = pool;