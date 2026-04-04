"use strict";

require("dotenv").config();

const shared = require("@satandbuy/shared");
const app = require("./app");
const connectDatabase = require("./lib/database");

const logger = shared.logger.createLogger({
  serviceName: "catalog-service",
});
const PORT = process.env.PORT || 5100;
const NATS_URL = process.env.NATS_URL || "nats://nats:4222";
const { EVENTS: ORDER_EVENTS } = shared.events.orders;
const { handleProductQuantity } = require("@satandbuy/catalog-domain").lib.productInventory;

async function bootstrap() {
  await shared.telemetry.start({ serviceName: "catalog-service" });
  await shared.events.bus.connect(NATS_URL);

  shared.events.bus.subscribe(ORDER_EVENTS.ORDER_PLACED, async (payload) => {
    logger.info({ orderId: payload.orderId }, "received ORDER_PLACED event");
    if (payload.cart) {
      await handleProductQuantity(payload.cart);
    }
  });

  await connectDatabase();
  app.listen(PORT, () => {
    logger.info({ port: PORT }, "catalog-service listening");
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "catalog-service bootstrap failure");
  process.exit(1);
});
