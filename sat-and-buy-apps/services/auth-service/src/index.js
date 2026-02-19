"use strict";

require("dotenv").config();

const shared = require("@satandbuy/shared");
const app = require("./app");
const connectDatabase = require("./lib/database");

const logger = shared.logger.createLogger({
  serviceName: "auth-service",
});
const PORT = process.env.PORT || 6001;

async function bootstrap() {
  await shared.telemetry.start({ serviceName: "auth-service" });
  await connectDatabase();

  app.listen(PORT, () => {
    logger.info({ port: PORT }, "auth-service listening");
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "auth-service bootstrap failure");
  process.exit(1);
});
