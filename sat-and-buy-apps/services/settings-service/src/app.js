"use strict";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const shared = require("@satandbuy/shared");

const settingRoutes = require("./routes/settingRoutes");

const app = express();
const metrics = shared.metrics.createMetrics({
  serviceName: "settings-service",
});

app.use(helmet());
app.use(
  cors({
    origin: shared.cors.buildCorsOriginOption(process.env.CORS_ORIGIN),
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(metrics.httpMiddleware);

app.get("/health", (_req, res) => {
  res.send({
    service: "settings-service",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/metrics", metrics.metricsHandler);
app.use("/api/setting", settingRoutes);

module.exports = app;
