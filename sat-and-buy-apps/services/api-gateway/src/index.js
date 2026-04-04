"use strict";

require("dotenv").config();

const shared = require("@satandbuy/shared");
const createApp = require("./app");

const logger = shared.logger.createLogger({
  serviceName: "api-gateway",
});
const PORT = process.env.PORT || 5055;

const config = {
  authUrl: process.env.AUTH_SERVICE_URL,
  catalogUrl: process.env.CATALOG_SERVICE_URL,
  orderUrl: process.env.ORDER_SERVICE_URL,
  settingsUrl: process.env.SETTINGS_SERVICE_URL,
  notificationUrl: process.env.NOTIFICATION_SERVICE_URL,
  deliveryUrl: process.env.DELIVERY_SERVICE_URL,
  boutiqueUrl: process.env.BOUTIQUE_SERVICE_URL,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  logLevel: process.env.LOG_LEVEL || "warn",
  logFormat: process.env.LOG_FORMAT || "dev",
};

async function bootstrap() {
  await shared.telemetry.start({ serviceName: "api-gateway" });
  const app = createApp(config);

  app.listen(PORT, () => {
    logger.info({ port: PORT }, "api-gateway listening");
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "api-gateway bootstrap failure");
  process.exit(1);
});
