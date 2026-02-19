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

const isAdmin = (req, res, next) => {
  if (!req.user || typeof req.user.role !== "string") {
    return res.status(403).send({ message: "Admin privileges required." });
  }

  if (req.user.role.toLowerCase() !== "admin") {
    return res.status(403).send({ message: "Admin privileges required." });
  }

  next();
};

module.exports = {
  isAuth,
  isAdmin,
};
