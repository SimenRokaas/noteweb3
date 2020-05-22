"use strict";

const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 5,
  host: "nl1-ss12.a2hosting.com",
  user: "tjkno_noter_skriv",
  password: "5lMBfsLu9vV3",
  database: "tjkno_noter"
});

pool.getConnection(function(err, connection) {
  if (err) throw err; // not connected!
  console.log("Koblet til TJK database!");

  // When done with the connection, release it.
  connection.release();
});

module.exports = pool;
