"use strict";

require("dotenv").config();

const shared = require("@satandbuy/shared");
const app = require("./app");
const connectDatabase = require("./lib/database");

const logger = shared.logger.createLogger({
  serviceName: "catalog-service",
});
const PORT = process.env.PORT || 5100;

async function bootstrap() {
  await shared.telemetry.start({ serviceName: "catalog-service" });
  await connectDatabase();
  app.listen(PORT, () => {
    logger.info({ port: PORT }, "catalog-service listening");
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "catalog-service bootstrap failure");
  process.exit(1);
});
