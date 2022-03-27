"use strict";

const express = require("express");
const router = express.Router();
const auth = require("./auth");
const pool = require("../database");

const apacheLog = "nedlastinger.log";
let numLogLines = 0;

router.get("/parselog", auth.authMiddleware, (req, res) => {
  numLogLines = countLogLines();
  if (numLogLines === 0) {
    console.log("Ingen logglinjer å parse! Noe er nok feil...");
    return;
  }
  console.log(
    "Fant " + numLogLines + " logglinjer. Trunkerer nedlastingstabell..."
  );
  truncateTable();

  console.log("Parser access-log...");
  parseAccessLog(res);
});

router.get("/list", auth.authMiddleware, (req, res) => {
  const fra = req.query.fra;
  const til = req.query.til;
  const aggrSett = req.query.aggrSett;
  let fileSelectPart = aggrSett === "true" ? "" : "nl.file, ";
  let fileGroupByPart = aggrSett === "true" ? "" : "file, ";
  console.log("fileSelectPart = " + fileSelectPart);
  console.log("fileGroupByPart = " + fileGroupByPart);
  pool.query(
    "  select nl.arkivnr, " +
      fileSelectPart +
      "n.tittel1, n.komponist, n.arrangor, count(*) as antall from noter_nedlastinger nl, noter n" +
      "    where nl.arkivnr = n.arkivnr and status = 200" +
      "    and nl.time between '" +
      fra +
      "' and '" +
      til +
      "' group by arkivnr, " +
      fileGroupByPart +
      "tittel1, komponist, arrangor order by antall desc",
    (error, nedlastinger) => {
      if (error) {
        console.error(error);
      }
      res.send(nedlastinger);
    }
  );
});

function countLogLines() {
  const { execSync } = require("child_process");
  const count = execSync("cat " + apacheLog + " | wc -l");
  return count.toString().trim();
}

function truncateTable() {
  pool.query("truncate noter_nedlastinger;", (err) => {
    if (err) {
      console.error(JSON.stringify(err));
      throw err;
    }
  });
}

function parseAccessLog(res) {
  // fs for å lese loggfil, alpine for å parse
  const fs = require("fs");
  const Alpine = require("alpine");
  const alpine = new Alpine();

  let loglines = [];
  alpine.parseReadStream(
    fs.createReadStream(apacheLog, { encoding: "utf8" }),
    (logline) => {
      loglines.push(record(logline));
      if (loglines.length >= numLogLines) {
        console.log("Parset " + loglines.length + " linjer fra access-logg.");
        populateTable(loglines);
        console.log("Lagret " + loglines.length + " linjer til database.");
        res.send(JSON.stringify(loglines.length));
      }
    }
  );
}

function populateTable(loglines) {
  const values = loglines.map(Object.values);
  pool.query(
    "insert into noter_nedlastinger (arkivnr, file, remoteHost, logname, remoteUser, time, request, status, size, referer, useragent) values ?",
    [values],
    (error) => {
      if (error) {
        console.error(JSON.stringify(error));
        throw error;
      }
    }
  );
}

function record(data) {
  let reqParts = getReqParts(data["request"]);
  return {
    arkivnr: blankIfNull(reqParts.arkivnr),
    file: blankIfNull(reqParts.pdf),
    remoteHost: blankIfNull(data["remoteHost"]),
    logname: blankIfNull(data["logname"]),
    remoteUser: blankIfNull(data["remoteUser"]),
    time: blankIfNull(apacheLogTimeToMysqlDatetime(data["time"])), // UTC
    request: blankIfNull(data["request"]),
    status: blankIfNull(data["status"]),
    size: blankIfNull(data["sizeCLF"]),
    referer: blankIfNull(data["RequestHeader Referer"]),
    useragent: blankIfNull(data["RequestHeader User-agent"]),
  };
}

function getReqParts(req) {
  // eksempel:  GET /TJK-medlem/02%20Noteskann/83%20Arkivnr%201601-1700/1674%20Rhapsody%20for%20flute/Rhapsody%20for%20flute%20soloflute.pdf HTTP/1.1
  const path = req.substr("GET ".length).split(" ")[0];
  if (!path.includes(".pdf")) {
    console.log("Fant ikke path!! Req: " + req);
    return {};
  }

  // finner arkivnr
  const match = path.match(/Arkivnr%20(\d*-\d*)\/(\d{4})/);
  if (match == null || match.size < 3) {
    console.log("Fant ikke match! " + match);
    return {};
  }
  const arkivnr = match[2];

  // finner pdf
  const pdf = decodeURIComponent(
    path.substr(path.lastIndexOf("/") + 1).slice(0, -4)
  );
  return {
    arkivnr: arkivnr,
    pdf: pdf,
  };
}

function apacheLogTimeToMysqlDatetime(apacheLogTime) {
  const t = apacheLogTime.replace(/\//g, "-").replace(" +0000", "Z");
  const tt = t.slice(0, 11) + " " + t.slice(-9);
  return new Date(tt).toISOString().slice(0, 19).replace("T", " ");
}

function blankIfNull(str) {
  return str === undefined ? "" : str;
}

module.exports = router;
