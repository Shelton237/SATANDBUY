"use strict";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const shared = require("@satandbuy/shared");

const boutiqueRoutes = require("./routes/boutiqueRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const boutiqueOrderRoutes = require("./routes/boutiqueOrderRoutes");

const app = express();
const metrics = shared.metrics.createMetrics({
  serviceName: "boutique-service",
});

app.use(helmet());
app.use(
  cors({
    origin: shared.cors.buildCorsOriginOption(process.env.CORS_ORIGIN),
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(metrics.httpMiddleware);

app.get("/health", (_req, res) => {
  res.send({
    service: "boutique-service",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
app.get("/metrics", metrics.metricsHandler);

// Serve uploaded images — Cross-Origin-Resource-Policy: cross-origin requis
// pour que le store (store.diginova.cm) puisse charger les images
// servies par le gateway (gateway.diginova.cm).
app.use("/api/boutiques/uploads", (_req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.use("/api/boutiques/uploads", express.static("/uploads/boutique"));

app.use("/api/boutiques/upload", uploadRoutes);
app.use("/api/boutiques", boutiqueRoutes);
app.use("/api/boutique-posts", postRoutes);
app.use("/api/boutique-comments", commentRoutes);
app.use("/api/boutique-orders", boutiqueOrderRoutes);

// Gestion globale des erreurs
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Erreur interne du serveur.";
  res.status(status).json({ message });
});

module.exports = app;
