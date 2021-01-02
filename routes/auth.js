"use strict";

const express = require("express");
const router = express.Router();
const passport = require("passport");
const conn = require("../database");

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).send([user, "Cannot log in", info]);
    }
    req.login(user, () => res.send("Logged in"));
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  console.log("logged out");
  return res.send();
});

const authMiddleware = (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.status(401).send("You are not authenticated");
  } else {
    return next();
  }
};

let users = [];
conn.query("select * from noter_brukere", function (error, result) {
  if (error) {
    console.error(error);
  }
  users = result;
});

router.get("/user", authMiddleware, (req, res) => {
  let user = users.find((user) => {
    return user.id === req.session.passport.user;
  });
  res.send({ user: user });
});

module.exports = { router, authMiddleware };
