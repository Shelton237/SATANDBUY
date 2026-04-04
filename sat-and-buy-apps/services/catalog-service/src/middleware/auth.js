"use strict";

const jwt = require("jsonwebtoken");

const extractToken = (authorization = "") => {
  if (!authorization.startsWith("Bearer ")) {
    return null;
  }
  return authorization.split(" ")[1];
};

const isAuth = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization || "");
    if (!token) {
      return res.status(401).send({ message: "Authorization token missing." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({
      message: error.message || "Invalid authentication token.",
    });
  }
};

const ADMIN_ROLES = ["admin", "trieur", "operations"];

const isAdmin = (req, res, next) => {
  const role = typeof req.user?.role === "string" ? req.user.role : "";
  if (!role) {
    return res.status(403).send({ message: "Admin privileges required." });
  }

  const normalized = role.trim().toLowerCase();
  if (!ADMIN_ROLES.includes(normalized)) {
    return res.status(403).send({ message: "Admin privileges required." });
  }

  next();
};

// Accepte tout JWT valide (admin, staff, ou client boutique owner)
const isAuthAny = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization || "");
    if (!token) {
      return res.status(401).send({ message: "Authorization token missing." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ message: "Invalid authentication token." });
  }
};

const isBoutiqueOwner = (user) =>
  user?.role?.toLowerCase() === "client";

module.exports = {
  isAuth,
  isAdmin,
  isAuthAny,
  isBoutiqueOwner,
};
