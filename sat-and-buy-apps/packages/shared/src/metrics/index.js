"use strict";

const client = require("prom-client");

const DEFAULT_BUCKETS = [0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10];

const createMetrics = (options = {}) => {
  const serviceName =
    options.serviceName ||
    process.env.SERVICE_NAME ||
    "satandbuy-service";
  const ignoredPaths = ["/metrics", "/health", ...(options.ignorePaths || [])];

  const shouldIgnore = (req) => {
    const combined = `${req.baseUrl || ""}${req.path || ""}` || req.originalUrl;
    if (!combined) {
      return false;
    }

    return ignoredPaths.some((path) =>
      path ? combined.startsWith(path) : false
    );
  };

  const register = new client.Registry();
  register.setDefaultLabels({
    service: serviceName,
    env: process.env.NODE_ENV || "development",
  });

  client.collectDefaultMetrics({
    register,
  });

  const httpDuration = new client.Histogram({
    name: options.httpMetricName || "http_server_duration_seconds",
    help: "Durée des requêtes HTTP en secondes",
    labelNames: ["method", "route", "status_code"],
    buckets: options.httpBuckets || DEFAULT_BUCKETS,
    registers: [register],
  });

  const httpMiddleware = (req, res, next) => {
    if (shouldIgnore(req)) {
      return next();
    }

    const end = httpDuration.startTimer();

    res.once("finish", () => {
      const route =
        req.route?.path ||
        `${req.baseUrl || ""}${req.path || ""}` ||
        req.originalUrl ||
        "unknown";

      end({
        method: req.method,
        route,
        status_code: res.statusCode,
      });
    });

    next();
  };

  const metricsHandler = async (_req, res) => {
    res.setHeader("Content-Type", register.contentType);
    res.end(await register.metrics());
  };

  return {
    register,
    client,
    httpDuration,
    httpMiddleware,
    metricsHandler,
  };
};

module.exports = {
  client,
  createMetrics,
};
