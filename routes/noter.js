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
  console.log("Oppdaterer arkivnr " + arkivNr);
  pool.query(
    "update noter set ? where arkivNr = ?",
    [record(req), arkivNr],
    function(error, results) {
      if (error) {
        console.error(JSON.stringify(error));
        throw error;
      }
      res.send(JSON.stringify(results));
    }
  );
});

router.post("/", (req, res) => {
  console.log("Oppretter arkivnr " + req.body.arkivNr);
  pool.query("insert into noter set ?;", record(req), function(error, results) {
    if (error) {
      console.error(JSON.stringify(error));
      throw error;
    }
    res.send(JSON.stringify(results));
  });
});

function record(req) {
  return {
    arkivNr: blankIfNull(req.body.arkivNr),
    tittel1: blankIfNull(req.body.tittel1),
    tittel2: blankIfNull(req.body.tittel2),
    soloInstrument: blankIfNull(req.body.soloInstrument),
    durata: blankIfNull(req.body.durata),
    kategori1: blankIfNull(req.body.kategori1),
    kategori2: blankIfNull(req.body.kategori2),
    kategori3: blankIfNull(req.body.kategori3),
    kommentar: blankIfNull(req.body.kommentar)
  };
}

function blankIfNull(str) {
  return str === undefined ? "" : str;
}

module.exports = router;
