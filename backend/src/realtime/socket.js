const { Server } = require("socket.io");
const { info } = require("../utils/logger");

function setupSocket(httpServer, corsOrigin) {
  const io = new Server(httpServer, {
    cors: { origin: corsOrigin, credentials: true }
  });

  io.on("connection", (socket) => {
    info("socket connected", { id: socket.id });

    socket.on("room:join", async ({ roomCode, nickname }) => {
      // MVP: só entra na sala no socket (depois vamos persistir no banco)
      socket.join(roomCode);
      io.to(roomCode).emit("room:message", { text: `${nickname} entrou na sala.` });
    });

    socket.on("admin:draw", async ({ roomCode, number }) => {
      io.to(roomCode).emit("draw:new", { number });
    });

    socket.on("disconnect", () => {
      info("socket disconnected", { id: socket.id });
    });
  });

  return io;
}

module.exports = { setupSocket };
