"use strict";
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const shared = require("@satandbuy/shared");

const orderRoutes = require("./routes/orderRoutes");
const customerOrderRoutes = require("./routes/customerOrderRoutes");
const shippingRateRoutes = require("./routes/shippingRateRoutes");
const { isAuth } = require("./middleware/auth");

const app = express();
const metrics = shared.metrics.createMetrics({
  serviceName: "order-service",
});

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(express.json({ limit: "4mb" }));
app.use(morgan("dev"));
app.use(metrics.httpMiddleware);

app.get("/health", (req, res) => {
  res.send({
    service: "order-service",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
app.get("/metrics", metrics.metricsHandler);

app.use("/api/orders", isAuth, orderRoutes);
app.use("/api/order", customerOrderRoutes);
app.use("/api/shipping-rate", shippingRateRoutes);

module.exports = app;
