"use strict";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const shared = require("@satandbuy/shared");

const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const metrics = shared.metrics.createMetrics({
  serviceName: "auth-service",
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

app.use("/health", require("./routes/healthRoutes"));
app.get("/metrics", metrics.metricsHandler);
app.use("/auth", routes);

app.use(errorHandler);

module.exports = app;
