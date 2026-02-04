function adminOnly(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Acesso negado (admin)." });
  }
  return next();
}

module.exports = { adminOnly };
