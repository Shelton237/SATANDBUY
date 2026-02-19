"use strict";

const createError = require("http-errors");

module.exports = (err, req, res, next) => {
  if (!err) {
    return next();
  }
  const status = err.status || err.statusCode || 500;
  const payload = {
    message: err.message || "Unexpected error",
  };
  if (process.env.NODE_ENV !== "production" && err.stack) {
    payload.stack = err.stack;
  }
  res.status(status).send(payload);
};
