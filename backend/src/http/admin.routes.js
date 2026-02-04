const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { authRequired, adminRequired } = require("../middlewares/auth");

const prisma = new PrismaClient();

// GET /api/admin/users (ADMIN)
router.get("/users", authRequired, adminRequired, async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  res.json({ users });
});

module.exports = router;
