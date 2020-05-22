"use strict";

const express = require("express");
const router = express.Router();

const pool = require("../database");

router.get("/list", (req, res) => {
  pool.query("select * from noter", function(error, noter) {
    if (error) {
      console.error(error);
    }
    res.send({
      noter: noter
    });
  });
});

module.exports = router;
