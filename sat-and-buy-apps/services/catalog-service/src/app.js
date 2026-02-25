"use strict";
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const shared = require("@satandbuy/shared");

const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const attributeRoutes = require("./routes/attributeRoutes");
const couponRoutes = require("./routes/couponRoutes");
const marketListRoutes = require("./routes/marketListRoutes");
const languageRoutes = require("./routes/languageRoutes");
const currencyRoutes = require("./routes/currencyRoutes");

const app = express();
const metrics = shared.metrics.createMetrics({
  serviceName: "catalog-service",
});

app.use(helmet());
app.use(
  cors({
    origin: shared.cors.buildCorsOriginOption(process.env.CORS_ORIGIN),
  })
);
app.use(express.json({ limit: "4mb" }));
app.use(morgan("dev"));
app.use(metrics.httpMiddleware);

app.get("/health", (req, res) => {
  res.send({
    service: "catalog-service",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
app.get("/metrics", metrics.metricsHandler);

app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/attributes", attributeRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/customer/market-lists", marketListRoutes);
app.use("/api/language", languageRoutes);
app.use("/api/currency", currencyRoutes);

module.exports = app;
