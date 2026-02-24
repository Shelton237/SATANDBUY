# @satandbuy/shared

Utilitaires communs (rôles, helpers JWT, connexion Mongo, observabilité) pour la transition microservices.

## Usage rapide

```js
const shared = require("@satandbuy/shared");

const { STAFF_ROLES } = shared.constants.roles;
const token = shared.auth.createAccessToken(user, {
  secret: process.env.JWT_SECRET,
});
await shared.mongo.createMongoConnection(process.env.MONGO_URI);
const logger = shared.logger.createLogger({ serviceName: "catalog-service" });
await shared.telemetry.start({ serviceName: "catalog-service" });
```

## Observabilité commune

- **Logger structuré** : `shared.logger.createLogger({ serviceName })` renvoie un logger [pino](https://github.com/pinojs/pino) configuré (niveau via `LOG_LEVEL`, beautifier `LOG_PRETTY` hors prod, labels `service/env`).
- **Traces OpenTelemetry** : `await shared.telemetry.start({ serviceName })` initialise le SDK Node + auto-instrumentations HTTP. Les exports utilisent `OTEL_EXPORTER_OTLP_ENDPOINT` (fallback console) et peuvent être désactivés via `OTEL_ENABLED=false`.
- **Métriques Prometheus** : `const metrics = shared.metrics.createMetrics({ serviceName })` crée un registre Prometheus exposable via `app.get("/metrics", metrics.metricsHandler)` et ajoute un middleware de durée HTTP (`metrics.httpMiddleware`). Par défaut les routes `/metrics` et `/health` sont ignorées.
