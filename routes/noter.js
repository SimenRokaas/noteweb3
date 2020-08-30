"use strict";

const express = require("express");
const router = express.Router();

const pool = require("../database");

router.get("/list", (req, res) => {
  pool.query("select * from noter order by arkivNr desc", (error, noter) => {
    if (error) {
      console.error(error);
    }
    res.send(noter);
  });
});

router.put("/:id", (req, res) => {
  var arkivNr = req.params.id;
  console.log("Oppdaterer arkivnr " + arkivNr);
  pool.query(
    "update noter set ? where arkivNr = ?",
    [record(req), arkivNr],
    (error, results) => {
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
  pool.query("insert into noter set ?;", record(req), (error, results) => {
    if (error) {
      console.error(JSON.stringify(error));
      throw error;
    }
    res.send(JSON.stringify(results));
  });
});

router.delete("/:id", (req, res) => {
  var arkivNr = req.params.id;
  console.log("Sletter arkivnr " + arkivNr);
  pool.query(
    "delete from noter where arkivNr = ?",
    [arkivNr],
    (error, results) => {
      if (error) {
        console.error(JSON.stringify(error));
        throw error;
      }
      res.send(JSON.stringify(results));
    }
  );
});

function record(req) {
  return {
    arkivNr: blankIfNull(req.body.ArkivNr),
    tittel1: blankIfNull(req.body.Tittel1),
    tittel2: blankIfNull(req.body.Tittel2),
    soloInstrument: blankIfNull(req.body.SoloInstrument),
    durata: blankIfNull(req.body.Durata),
    kategori1: blankIfNull(req.body.Kategori1),
    kategori2: blankIfNull(req.body.Kategori2),
    kategori3: blankIfNull(req.body.Kategori3),
    kommentar: blankIfNull(req.body.Kommentar),
    komponist: blankIfNull(req.body.Komponist),
    land: blankIfNull(req.body.Land),
    arrangor: blankIfNull(req.body.Arrangor),
    arrangertFor1: blankIfNull(req.body.ArrangertFor1),
    arrangertFor2: blankIfNull(req.body.ArrangertFor2)
  };
}

function blankIfNull(str) {
  return str === undefined ? "" : str;
}

module.exports = router;
