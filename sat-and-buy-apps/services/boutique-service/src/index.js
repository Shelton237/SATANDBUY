"use strict";

require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./lib/database");
const shared = require("@satandbuy/shared");

const logger = shared.logger.createLogger({
  serviceName: "boutique-service",
});

const PORT = process.env.PORT || 5600;

async function bootstrap() {
  await shared.telemetry.start({ serviceName: "boutique-service" });
  await connectDatabase();

  app.listen(PORT, () => {
    logger.info({ port: PORT }, "boutique-service listening");
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "boutique-service bootstrap failure");
  process.exit(1);
});
