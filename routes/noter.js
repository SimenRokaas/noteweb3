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

router.put("/:id", (req, res) => {
  var arkivNr = req.params.id;
  var form_data = {
    tittel1: req.body.tittel1,
    tittel2: req.body.tittel2,
    soloInstrument: req.body.soloInstrument,
    durata: req.body.durata,
    kategori1: req.body.kategori1,
    kategori2: req.body.kategori2,
    kategori3: req.body.kategori3,
    kommentar: req.body.kommentar
  };
  pool.query(
    "update noter set ? where arkivNr = ?",
    [form_data, arkivNr],
    function(error, results) {
      if (error) {
        console.error(JSON.stringify(error));
        throw error;
      }
      res.send(JSON.stringify(results));
    }
  );
});

module.exports = router;
