#!/usr/bin/env node
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const conn = require("./database");
const app = express();
const cookieSession = require("cookie-session");
const passport = require("passport");

// getting the local authentication type
const LocalStrategy = require("passport-local").Strategy;

// init db by querying number of notes
conn.query("select count(*) as antall from noter", function (error, antall) {
  if (error) {
    console.error(error);
  }
  console.log("Antall noter i databasen: " + antall[0].antall);
});

// configure middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
// CORS: must allow requests from frontend (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: "http://localhost:8080",
      credentials: true,
      optionsSuccessStatus: 204,
    })
  );
}

// init auth cookie
app.use(
  cookieSession({
    name: "tjknoter-session",
    keys: ["vueauthrandomkey"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

let users = [];
conn.query("select * from noter_brukere", function (error, result) {
  if (error) {
    console.error(error);
  }
  users = result;
  console.log("Antall brukere i databasen: " + users.length);
});

// init auth with passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(
    {
      usernameField: "bruker",
      passwordField: "passord",
    },
    (username, password, done) => {
      let user = users.find((user) => {
        return Buffer.from(password).toString("base64") === user.passord;
      });

      if (user) {
        done(null, user);
      } else {
        done(null, false, { message: "Feil brukernavn eller passord" });
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  let user = users.find((user) => {
    return user.id === id;
  });
  done(null, user);
});

// routes for the app
app.use("/auth", require("./routes/auth").router);
app.use("/arkiv", require("./routes/arkiv"));

console.log("Env: " + process.env.NODE_ENV);
if (process.env.NODE_ENV !== "development") {
  // configure express to use public folder
  const publicRoot = "frontend/dist";
  app.use(express.static(publicRoot));
  app.get("/", (req, res) => {
    res.sendFile("index.html", { root: publicRoot });
  });
}
const port = process.env.port || 57462;
app.set("port", port); // set express to use this port
const server = app.listen(port, () => {
  if (typeof PhusionPassenger !== "undefined") {
    console.log("TJK Notearkiv server kjører i Passenger.");
  } else {
    console.log(`TJK Notearkiv server kjører på port ${port}.`);
  }
});
process.on("SIGTERM", () => {
  server.close((err) => {
    console.log("TJK Notearkiv server er avsluttet.");
    process.exit(err ? 1 : 0);
  });
});
