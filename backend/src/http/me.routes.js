const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { authRequired } = require("../middlewares/auth");

const prisma = new PrismaClient();

// GET /api/me
router.get("/", authRequired, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load user" });
  }
});

// GET /api/me/history
router.get("/history", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;

    const rooms = await prisma.room.findMany({
      where: {
        status: "FINISHED",
        players: {
          some: { userId },
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        winner: true,
      },
    });

    const history = rooms.map((room) => {
      const won = room.winner?.userId === userId;

      return {
        roomId: room.id,
        code: room.code,
        name: room.name,
        prize: room.prize,
        finishedAt: room.winner?.createdAt ?? room.updatedAt ?? null,
        won,
      };
    });

    return res.json({ history });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load history" });
  }
});

module.exports = router;
