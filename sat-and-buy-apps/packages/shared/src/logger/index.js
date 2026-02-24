"use strict";

const pino = require("pino");

const createLogger = (options = {}) => {
  const serviceName =
    options.serviceName ||
    process.env.SERVICE_NAME ||
    "satandbuy-service";
  const level = options.level || process.env.LOG_LEVEL || "info";
  const pretty =
    options.pretty ??
    (process.env.NODE_ENV !== "production" &&
      process.env.LOG_PRETTY !== "false");

  const transport = pretty
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined;

  return pino({
    level,
    transport,
    base: {
      service: serviceName,
      env: process.env.NODE_ENV || "development",
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: ["req.headers.authorization", "headers.authorization"],
  });
};

module.exports = {
  createLogger,
};
