"use strict";

const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 5,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB,
});

pool.getConnection(function(err, connection) {
  if (err) throw err; // not connected!
  console.log("Koblet til TJK database!");

  // When done with the connection, release it.
  connection.release();
});

module.exports = pool;
