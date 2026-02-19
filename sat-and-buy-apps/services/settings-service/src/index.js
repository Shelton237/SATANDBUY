"use strict";

require("dotenv").config();

const shared = require("@satandbuy/shared");
const app = require("./app");
const connectDatabase = require("./lib/database");

const logger = shared.logger.createLogger({
  serviceName: "settings-service",
});
const PORT = process.env.PORT || 5300;

async function bootstrap() {
  await shared.telemetry.start({ serviceName: "settings-service" });
  await connectDatabase();
  app.listen(PORT, () => {
    logger.info({ port: PORT }, "settings-service listening");
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "settings-service bootstrap failure");
  process.exit(1);
});
