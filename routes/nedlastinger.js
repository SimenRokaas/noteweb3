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
    "insert into noter_nedlastinger (arkivnr, remoteHost, logname, remoteUser, time, request, status, size, referer, useragent) values ?",
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
  return {
    arkivnr: blankIfNull(getArkivNr(data["request"])),
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

function getArkivNr(req) {
  // eksempel: ...Arkivnr%201701-1800/1706%20Kjempevisesl%c3%a5tten/
  // => arkivnr = 1706
  const pattern = /Arkivnr%20(\d{4}-\d{4})\/(\d{4})/;
  const match = req.match(pattern);
  if (match == null || match.size < 3) {
    return 0;
  }
  return match[2];
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
