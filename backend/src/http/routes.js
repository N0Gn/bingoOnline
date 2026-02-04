const router = require("express").Router();

router.get("/health", (req, res) => res.json({ ok: true }));

router.use("/auth", require("./auth.routes"));
router.use("/me", require("./me.routes"));
router.use("/rooms", require("./rooms.routes"));

// 👇 NOVO
router.use("/admin", require("./admin.routes"));

module.exports = router;
