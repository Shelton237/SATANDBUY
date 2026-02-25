"use strict";

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const shared = require("@satandbuy/shared");

const rewriteOriginalPath = (_path, req) => req.originalUrl || _path;

const rewritePrefix = (pattern, replacement) => (path, req) =>
  (req.originalUrl || path).replace(pattern, replacement);

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
      origin: shared.cors.buildCorsOriginOption(config.corsOrigin),
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
        pathRewrite: rewritePrefix(/^\/api\/auth/, "/auth"),
      })
    );
    app.use(
      "/api/admin",
      buildProxy(config.authUrl, {
        logLevel: config.logLevel,
        pathRewrite: rewritePrefix(/^\/api\/admin/, "/auth/admin"),
      })
    );
    app.use(
      "/api/customer",
      buildProxy(config.authUrl, {
        logLevel: config.logLevel,
        pathRewrite: rewritePrefix(/^\/api\/customer/, "/auth/customer"),
      })
    );
  }

  if (config.catalogUrl) {
    app.use(
      "/api/catalog",
      buildProxy(config.catalogUrl, {
        logLevel: config.logLevel,
        pathRewrite: rewritePrefix(/^\/api\/catalog/, "/api"),
      })
    );
  }

  if (config.orderUrl) {
    app.use(
      "/api/orders",
      buildProxy(config.orderUrl, {
        logLevel: config.logLevel,
        pathRewrite: rewriteOriginalPath,
      })
    );
    app.use(
      "/api/order",
      buildProxy(config.orderUrl, {
        logLevel: config.logLevel,
        pathRewrite: rewriteOriginalPath,
      })
    );
    app.use(
      "/api/shipping-rate",
      buildProxy(config.orderUrl, {
        logLevel: config.logLevel,
        pathRewrite: rewriteOriginalPath,
      })
    );
  }

  if (config.settingsUrl) {
    app.use(
      "/api/setting",
      buildProxy(config.settingsUrl, {
        logLevel: config.logLevel,
        pathRewrite: rewriteOriginalPath,
      })
    );
  }

  if (config.notificationUrl) {
    app.use(
      "/api/notification",
      buildProxy(config.notificationUrl, {
        logLevel: config.logLevel,
        pathRewrite: rewriteOriginalPath,
      })
    );
  }

  if (config.deliveryUrl) {
    app.use(
      "/api/delivery",
      buildProxy(config.deliveryUrl, {
        logLevel: config.logLevel,
        pathRewrite: rewriteOriginalPath,
      })
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
