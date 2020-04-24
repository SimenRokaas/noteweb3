const express = require('express');
const router = express.Router();

const pool = require("../database");

const dummyNoter = require('../dummynoter.json');
const useDummy = true;

router.get('/list', (req, res) => {
  if (useDummy) {
    console.log("Sender dummy-noter!");
    res.send({
      noter: dummyNoter
    });
  } else {
    pool.query("select * from noter", function (error, noter) {
      if (error) {
        console.error(error);
      }
      res.send({
        noter: noter
      })
    });
  }
});

module.exports = router;