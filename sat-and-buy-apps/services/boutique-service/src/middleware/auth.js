"use strict";

const jwt = require("jsonwebtoken");

const extractToken = (authorization = "") => {
  if (!authorization.startsWith("Bearer ")) return null;
  return authorization.split(" ")[1];
};

const isAuth = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization || "");
    if (!token) return res.status(401).json({ message: "Token d'autorisation manquant." });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalide." });
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization || "");
    if (token) {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    }
  } catch (_) {
    // ignore – token optionnel
  }
  next();
};

const ADMIN_ROLES = ["admin", "trieur", "operations"];

const isAdmin = (req, res, next) => {
  const role = typeof req.user?.role === "string" ? req.user.role.trim().toLowerCase() : "";
  if (!ADMIN_ROLES.includes(role)) {
    return res.status(403).json({ message: "Accès réservé aux administrateurs." });
  }
  next();
};

module.exports = { isAuth, optionalAuth, isAdmin };
