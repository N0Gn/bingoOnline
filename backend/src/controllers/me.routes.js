const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { authRequired } = require("../middlewares/auth");
const { getMyHistory } = require("../controllers/me.controller");

const prisma = new PrismaClient();

router.get("/", authRequired, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  res.json({ user });
});

// NOVO: /api/me/history
router.get("/history", authRequired, getMyHistory);

module.exports = router;
