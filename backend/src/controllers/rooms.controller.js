const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");

const prisma = new PrismaClient();

function generateRoomCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function winPatterns5x5() {
  const patterns = [];
  for (let r = 0; r < 5; r++) patterns.push(Array.from({ length: 5 }, (_, c) => r * 5 + c));
  for (let c = 0; c < 5; c++) patterns.push(Array.from({ length: 5 }, (_, r) => r * 5 + c));
  patterns.push([0, 6, 12, 18, 24]);
  patterns.push([4, 8, 12, 16, 20]);
  return patterns;
}

async function createCardForUser(roomId, userId) {
  const numbers = shuffle(Array.from({ length: 75 }, (_, i) => i + 1)).slice(0, 25);

  const card = await prisma.card.create({
    data: {
      roomId,
      userId,
      cells: {
        create: numbers.map((value, idx) => ({
          position: idx,
          value,
          marked: false,
        })),
      },
    },
    include: { cells: true },
  });

  return card;
}

// GET /api/rooms (logado)
async function listRooms(req, res) {
  const userId = req.user.id;

  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      winner: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      players: { select: { userId: true } },
    },
  });

  const result = rooms.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    status: r.status,
    prize: r.prize,
    createdAt: r.createdAt,
    playersCount: r.players.length,
    isParticipating: r.players.some((p) => p.userId === userId),

    winnerUserId: r.winner?.userId ?? null,
    winner: r.winner
      ? {
          userId: r.winner.userId,
          createdAt: r.winner.createdAt,
          pattern: r.winner.pattern,
          user: r.winner.user, // {id,name,email}
        }
      : null,
  }));

  return res.json({ rooms: result });
}

// POST /api/rooms (ADMIN)
async function createRoom(req, res) {
  const schema = z.object({
    name: z.string().min(2),
    prize: z.string().min(1).optional(),
  });

  const { name, prize } = schema.parse(req.body);

  let code = generateRoomCode();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.room.findUnique({ where: { code } });
    if (!exists) break;
    code = generateRoomCode();
  }

  const room = await prisma.room.create({
    data: { name, prize: prize ?? null, code, status: "WAITING" },
    select: { id: true, code: true, name: true, prize: true, status: true, createdAt: true },
  });

  return res.status(201).json({ room });
}

// POST /api/rooms/:code/join (logado)
async function joinRoom(req, res) {
  const userId = req.user.id;
  const { code } = req.params;

  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) return res.status(404).json({ message: "Sala não encontrada" });

  if (room.status === "FINISHED") {
    return res.status(400).json({ message: "Sala encerrada" });
  }

  await prisma.roomPlayer.upsert({
    where: { roomId_userId: { roomId: room.id, userId } },
    update: {},
    create: { roomId: room.id, userId },
  });

  let card = await prisma.card.findFirst({
    where: { roomId: room.id, userId },
    include: { cells: true },
  });

  if (!card) card = await createCardForUser(room.id, userId);

  return res.json({
    room: { id: room.id, code: room.code, name: room.name, status: room.status, prize: room.prize },
    card: {
      id: card.id,
      cells: card.cells
        .sort((a, b) => a.position - b.position)
        .map((c) => ({ position: c.position, value: c.value, marked: c.marked })),
    },
  });
}

// GET /api/rooms/:code (logado)
async function getRoomByCode(req, res) {
  const userId = req.user.id;
  const { code } = req.params;

  const room = await prisma.room.findUnique({
    where: { code },
    include: {
      winner: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      draws: { orderBy: { drawnAt: "desc" } },
      players: { select: { userId: true } },
    },
  });

  if (!room) return res.status(404).json({ message: "Sala não encontrada" });

  const isParticipating = room.players.some((p) => p.userId === userId);

  const card = await prisma.card.findFirst({
    where: { roomId: room.id, userId },
    include: { cells: true },
  });

  return res.json({
    room: {
      id: room.id,
      code: room.code,
      name: room.name,
      status: room.status,
      prize: room.prize,
      playersCount: room.players.length,
      isParticipating,
      winnerUserId: room.winner?.userId ?? null,
      finishedAt: room.winner?.createdAt ?? null,
      winner: room.winner
        ? {
            userId: room.winner.userId,
            pattern: room.winner.pattern,
            createdAt: room.winner.createdAt,
            user: room.winner.user,
          }
        : null,
    },
    draws: room.draws.map((d) => ({ number: d.number, drawnAt: d.drawnAt })),
    card: card
      ? {
          id: card.id,
          cells: card.cells
            .sort((a, b) => a.position - b.position)
            .map((c) => ({ position: c.position, value: c.value, marked: c.marked })),
        }
      : null,
  });
}

// POST /api/rooms/:code/mark (logado)
async function markCell(req, res) {
  const userId = req.user.id;
  const { code } = req.params;

  const bodySchema = z.object({
    position: z.number().int().min(0).max(24),
    marked: z.boolean(),
  });
  const { position, marked } = bodySchema.parse(req.body);

  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) return res.status(404).json({ message: "Sala não encontrada" });

  if (room.status === "FINISHED") {
    return res.status(400).json({ message: "Sala encerrada" });
  }

  const card = await prisma.card.findFirst({
    where: { roomId: room.id, userId },
  });
  if (!card) return res.status(400).json({ message: "Você não tem cartela nesta sala" });

  const cell = await prisma.cardCell.update({
    where: { cardId_position: { cardId: card.id, position } },
    data: { marked },
  });

  return res.json({
    cell: { position: cell.position, value: cell.value, marked: cell.marked },
  });
}

// POST /api/rooms/:code/draw (ADMIN)
async function drawNumber(req, res) {
  const { code } = req.params;

  const room = await prisma.room.findUnique({
    where: { code },
    include: { draws: true },
  });
  if (!room) return res.status(404).json({ message: "Sala não encontrada" });

  if (room.status === "FINISHED") return res.status(400).json({ message: "Sala encerrada" });

  const drawnSet = new Set(room.draws.map((d) => d.number));
  const available = [];
  for (let n = 1; n <= 75; n++) if (!drawnSet.has(n)) available.push(n);

  if (available.length === 0) return res.status(400).json({ message: "Todos os números já foram sorteados" });

  const number = available[Math.floor(Math.random() * available.length)];

  const created = await prisma.draw.create({
    data: { roomId: room.id, number },
  });

  if (room.status === "WAITING") {
    await prisma.room.update({ where: { id: room.id }, data: { status: "RUNNING" } });
  }

  return res.json({
    draw: { number: created.number, drawnAt: created.drawnAt },
  });
}

// POST /api/rooms/:code/claim (logado)
async function claimBingo(req, res) {
  const userId = req.user.id;
  const { code } = req.params;

  const room = await prisma.room.findUnique({
    where: { code },
    include: {
      draws: true,
      winner: true,
    },
  });
  if (!room) return res.status(404).json({ message: "Sala não encontrada" });

  if (room.status === "FINISHED" || room.winner) {
    return res.status(400).json({ message: "Sala já finalizada" });
  }

  const card = await prisma.card.findFirst({
    where: { roomId: room.id, userId },
    include: { cells: true },
  });
  if (!card) return res.status(400).json({ message: "Você não tem cartela nesta sala" });

  const cells = [...card.cells].sort((a, b) => a.position - b.position);

  const drawnNumbers = new Set(room.draws.map((d) => d.number));
  const markedPositions = new Set(cells.filter((c) => c.marked).map((c) => c.position));

  const patterns = winPatterns5x5();
  let matchedPattern = null;

  for (const p of patterns) {
    const ok = p.every((pos) => markedPositions.has(pos));
    if (!ok) continue;

    const patternValues = p.map((pos) => cells[pos].value);
    const allDrawn = patternValues.every((v) => drawnNumbers.has(v));
    if (!allDrawn) continue;

    matchedPattern = p;
    break;
  }

  if (!matchedPattern) {
    return res.status(400).json({ message: "Bingo inválido (padrão não completo ou números não sorteados)" });
  }

  const patternStr = JSON.stringify(matchedPattern);

  const result = await prisma.$transaction(async (tx) => {
    const winner = await tx.winner.create({
      data: {
        roomId: room.id,
        userId,
        pattern: patternStr,
      },
    });

    await tx.room.update({
      where: { id: room.id },
      data: { status: "FINISHED" },
    });

    return winner;
  });

  return res.json({
    ok: true,
    winner: { userId: result.userId, createdAt: result.createdAt },
  });
}

// POST /api/rooms/:code/close (ADMIN)
async function closeRoom(req, res) {
  const { code } = req.params;

  const room = await prisma.room.findUnique({
    where: { code },
    include: { winner: true },
  });
  if (!room) return res.status(404).json({ message: "Sala não encontrada" });

  if (room.status === "FINISHED") {
    return res.status(400).json({ message: "Sala já encerrada" });
  }

  await prisma.room.update({
    where: { id: room.id },
    data: { status: "FINISHED" },
  });

  return res.json({ ok: true });
}

module.exports = {
  listRooms,
  createRoom,
  joinRoom,
  getRoomByCode,
  markCell,
  drawNumber,
  claimBingo,
  closeRoom,
};
