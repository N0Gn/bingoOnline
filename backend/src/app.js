const express = require("express");
const cors = require("cors");
const { corsOrigin } = require("./config/env");
const routes = require("./http/routes");

function createApp() {
  const app = express();

  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(express.json());

  app.use("/api", require("./http/routes"));


  return app;
}

module.exports = { createApp };
