const http = require("http");
const { createApp } = require("./app");
const { port, corsOrigin } = require("./config/env");
const { setupSocket } = require("./realtime/socket");
const { info } = require("./utils/logger");

const app = createApp();
const server = http.createServer(app);

setupSocket(server, corsOrigin);

server.listen(port, () => {
  info("backend running", { port });
});
