"use strict";

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const shared = require("@satandbuy/shared");

const buildProxy = (target, options = {}) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    logLevel: options.logLevel || "warn",
    pathRewrite: options.pathRewrite,
    ws: true,
  });

const createGatewayApp = (config) => {
  const app = express();
  const metrics = shared.metrics.createMetrics({
    serviceName: "api-gateway",
  });
  app.use(
    cors({
      origin: config.corsOrigin || "*",
      credentials: false,
    })
  );
  app.use(morgan(config.logFormat || "dev"));
  app.use(metrics.httpMiddleware);

  if (config.authUrl) {
    app.use(
      "/api/auth",
      buildProxy(config.authUrl, {
        logLevel: config.logLevel,
        pathRewrite: { "^/api/auth": "/auth" },
      })
    );
  }

  if (config.catalogUrl) {
    app.use(
      "/api/catalog",
      buildProxy(config.catalogUrl, {
        logLevel: config.logLevel,
        pathRewrite: { "^/api/catalog": "/api" },
      })
    );
  }

  if (config.orderUrl) {
    app.use(
      "/api/orders",
      buildProxy(config.orderUrl, { logLevel: config.logLevel })
    );
    app.use(
      "/api/order",
      buildProxy(config.orderUrl, { logLevel: config.logLevel })
    );
    app.use(
      "/api/shipping-rate",
      buildProxy(config.orderUrl, { logLevel: config.logLevel })
    );
  }

  if (config.settingsUrl) {
    app.use(
      "/api/setting",
      buildProxy(config.settingsUrl, { logLevel: config.logLevel })
    );
  }

  if (config.notificationUrl) {
    app.use(
      "/api/notification",
      buildProxy(config.notificationUrl, { logLevel: config.logLevel })
    );
  }

  if (config.deliveryUrl) {
    app.use(
      "/api/delivery",
      buildProxy(config.deliveryUrl, { logLevel: config.logLevel })
    );
  }

  app.get("/health", (_req, res) => {
    res.send({
      service: "api-gateway",
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });
  app.get("/metrics", metrics.metricsHandler);

  return app;
};

module.exports = createGatewayApp;
