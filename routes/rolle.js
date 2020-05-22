"use strict";

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  if (process.env.NODE_ENV === "development") {
    res.send({
      kanSkrive: true,
      fordi: "utviklingsmodus"
    });
  } else {
    require("https")
      .get("https://tjk.no/styreside-test/", cb => {
        cb.setEncoding("utf8");
        cb.on("data", d => {
          // hvis body inneholder "Notearkiv har skriverettighet!" så betyr det at
          // bruker er logget inn på tjk.no med styre-rolle og har skriverettighet
          // i notearkivet.
          if (d.toString().indexOf("Notearkiv har skriverettighet!") > -1) {
            res.send({
              kanSkrive: true,
              fordi: "logget på tjk.no med styre-rolle"
            });
          } else {
            res.send({
              kanSkrive: false
            });
          }
        });
      })
      .on("error", e => {
        console.error(e);
      });
  }
});

module.exports = router;
