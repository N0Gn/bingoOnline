const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getMyHistory(req, res) {
  try {
    const userId = req.user.id;

    const rooms = await prisma.room.findMany({
      where: {
        status: "FINISHED",
        players: { some: { userId } },
      },
      orderBy: { createdAt: "desc" },
      include: {
        winner: true, // Winner tem userId, createdAt, etc
      },
    });

    const history = rooms.map((room) => {
      const won = room.winner?.userId === userId;

      return {
        roomId: room.id,
        code: room.code,
        name: room.name,
        prize: room.prize,
        finishedAt: room.winner?.createdAt ?? null,
        won,
      };
    });

    // IMPORTANTE: aqui devolve um ARRAY puro (não {history: ...})
    return res.json(history);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load history" });
  }
}

module.exports = { getMyHistory };
