const mysql = require('mysql');
const { promisify } = require('util');
const config= require('./config');
const { database } = config;

const pool = mysql.createPool(database);

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Terputus dengan database.");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Terlalu banyak koneksi dengan database.");
    }
    if (err.code === "ECONNREFUSED") {
      console.error("Tidak terhubung dengan database");
    }
  }
  if (connection) connection.release();
  console.log("DB is Connected");
  return;
});

pool.query = promisify(pool.query);

module.exports = pool;
