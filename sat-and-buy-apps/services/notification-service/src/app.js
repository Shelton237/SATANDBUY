"use strict";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const shared = require("@satandbuy/shared");

const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const metrics = shared.metrics.createMetrics({
  serviceName: "notification-service",
});

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(metrics.httpMiddleware);

app.get("/health", (_req, res) => {
  res.send({
    service: "notification-service",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/metrics", metrics.metricsHandler);
app.use("/api/notification", notificationRoutes);

module.exports = app;
