const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const conn = require("./database");
const app = express();

// init db by querying number of notes
conn.query("select count(*) as antall from noter", function(error, antall) {
  if (error) {
    console.error(error);
  }
  console.log("Antall noter i databasen: " + antall[0].antall);
});

// configure middleware
const port = 3000;
app.set("port", process.env.port || port); // set express to use this port
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
// CORS: must allow requests from frontend (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: "http://localhost:8080",
      credentials: true,
      optionsSuccessStatus: 204
    })
  );
}

// routes for the app
app.use("/noter", require("./routes/noter"));
app.use("/rolle", require("./routes/rolle"));

console.log("Env: " + process.env.NODE_ENV);
if (process.env.NODE_ENV !== "development") {
  // configure express to use public folder
  const publicRoot = "../frontend/dist";
  app.use(express.static(publicRoot));
  app.get("/", (req, res) => {
    res.sendFile("index.html", { root: publicRoot });
  });
}
app.listen(port, () =>
  console.log(`TJK Notearkiv server kjører på port ${port}.`)
);
