const router = require("express").Router();
const { authRequired, adminRequired } = require("../middlewares/auth");

const {
  listRooms,
  createRoom,
  joinRoom,
  getRoomByCode,
  markCell,
  drawNumber,
  claimBingo,
  closeRoom,
} = require("../controllers/rooms.controller");

// Listar salas (logado)
router.get("/", authRequired, listRooms);

// Criar bingo (ADMIN)
router.post("/", authRequired, adminRequired, createRoom);

// Detalhes da sala + cartela + draws
router.get("/:code", authRequired, getRoomByCode);

// Entrar numa sala
router.post("/:code/join", authRequired, joinRoom);

// Marcar célula (persistir)
router.post("/:code/mark", authRequired, markCell);

// Sortear número (ADMIN)
router.post("/:code/draw", authRequired, adminRequired, drawNumber);


// Pedir validação de bingo
router.post("/:code/claim", authRequired, claimBingo);

// Encerrar bingo (ADMIN)
router.post("/:code/close", authRequired, adminRequired, closeRoom);

module.exports = router;
