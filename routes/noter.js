"use strict";

const express = require("express");
const router = express.Router();

const pool = require("../database");

const axios = require("axios");
const $ = require("cheerio");
const NOTESKANN_BASE = "https://tjk.no/TJK-medlem/02 Noteskann/";

const auth = require("./auth");

router.get("/list", auth.authMiddleware, (req, res) => {
  pool.query("select * from noter order by arkivNr desc", (error, noter) => {
    if (error) {
      console.error(error);
    }
    res.send(noter);
  });
});

router.put("/:id", auth.authMiddleware, (req, res) => {
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

router.post("/", auth.authMiddleware, (req, res) => {
  console.log("Oppretter arkivnr " + req.body.arkivNr);
  pool.query("insert into noter set ?", record(req), (error, results) => {
    if (error) {
      console.error(JSON.stringify(error));
      throw error;
    }
    res.send(JSON.stringify(results));
  });
});

router.delete("/:id", auth.authMiddleware, (req, res) => {
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

router.get("/skanliste/:id", auth.authMiddleware, (req, res) => {
  const arkivNr = req.params.id.padStart(4, "0");
  const hundrerMappeUrl = getHundrerMappeUrl(arkivNr);

  getHtmlContent(hundrerMappeUrl).then((html) => {
    const linkObjects = $("a", html);
    let funnet = false;
    linkObjects.each((i, link) => {
      // finn link som matcher arkivnr
      const href = $(link).attr("href");
      if (href.startsWith(arkivNr)) {
        funnet = true;
        const noteUrl = hundrerMappeUrl + "/" + href;
        getHtmlContent(noteUrl).then((html) => {
          const partObjects = $("a", html);
          const links = [];
          partObjects.each((i, part) => {
            links.push({
              text: $(part).text().trim(),
              href: noteUrl + $(part).attr("href"),
            });
          });
          res.send(links);
        });
      }
    });
    if (!funnet) {
      res.send([]); // "Skannet note " + arkivNr + " ikke funnet!");
    }
  });
});

function getHundrerMappeUrl(arkivNr) {
  // genererer linker fra arkivnr
  // arkivnr 1-100 har mappe 99 Arkivnr 1-100
  // arkivnr 101-200 har mappe 98 Arkivnr 101-200
  // osv
  const num = Math.floor((arkivNr - 1) / 100);
  const hundrerMappeNr = 99 - num;
  const fra = num * 100 + 1;
  const til = fra + 99;
  return NOTESKANN_BASE + hundrerMappeNr + " Arkivnr " + fra + "-" + til;
}

function getHtmlContent(url) {
  return axios
    .get(url, { headers: { "User-agent": "tjk-noteweb" } })
    .then((res) => res.data)
    .catch((error) => console.error(error));
}

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
    arrangertFor2: blankIfNull(req.body.ArrangertFor2),
    prosjekt: blankIfNull(req.body.Prosjekt),
  };
}

function blankIfNull(str) {
  return str === undefined ? "" : str;
}

module.exports = router;
