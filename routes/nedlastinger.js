"use strict";

const express = require("express");
const router = express.Router();
const auth = require("./auth");
const pool = require("../database");

const apacheLog = "nedlastinger.log";
let numLogLines = 0;
let processedLogLines = 0;

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

  processedLogLines = 0;
  alpine.parseReadStream(
    fs.createReadStream(apacheLog, { encoding: "utf8" }),
    (data) => {
      populateTable(data);
      if (processedLogLines >= numLogLines) {
        console.log(
          "Prosessert " + processedLogLines + " linjer fra access-logg."
        );
        res.send(JSON.stringify(processedLogLines));
      }
    }
  );
}

function populateTable(data) {
  pool.query("insert into noter_nedlastinger set ?", record(data), (error) => {
    if (error) {
      console.error(JSON.stringify(error));
      throw error;
    }
  });
  processedLogLines++;
}

function record(data) {
  return {
    arkivnr: 0,
    remoteHost: blankIfNull(data.remoteHost),
    logname: blankIfNull(data.logname),
    remoteUser: blankIfNull(data.remoteUser),
    time: blankIfNull(apacheLogTimeToMysqlDatetime(data.time)), // UTC
    request: blankIfNull(data.request),
    status: blankIfNull(data.status),
    size: blankIfNull(data.sizeCLF),
    referer: blankIfNull("data.RequestHeader Referer"),
    useragent: blankIfNull("data.RequestHeader User-agent"),
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
