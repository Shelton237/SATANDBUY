"use strict";

require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./lib/database");
const shared = require("@satandbuy/shared");
const { EVENTS: ORDER_EVENTS } = shared.events.orders;
const eventBus = shared.events.bus;
const logger = shared.logger.createLogger({
  serviceName: "order-service",
});

const PORT = process.env.PORT || 5200;
const NATS_URL = process.env.NATS_URL || "nats://nats:4222";

async function bootstrap() {
  await shared.telemetry.start({ serviceName: "order-service" });
  await eventBus.connect(NATS_URL);

  eventBus.subscribe(ORDER_EVENTS.ORDER_PLACED, (payload = {}) => {
    logger.info(
      { event: ORDER_EVENTS.ORDER_PLACED, orderId: payload.orderId },
      "order event received"
    );
  });
  eventBus.subscribe(ORDER_EVENTS.ORDER_DELIVERY_CONFIRMED, (payload = {}) => {
    logger.info(
      {
        event: ORDER_EVENTS.ORDER_DELIVERY_CONFIRMED,
        orderId: payload.orderId,
      },
      "order event received"
    );
  });

  await connectDatabase();
  app.listen(PORT, () => {
    logger.info({ port: PORT }, "order-service listening");
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "order-service bootstrap failure");
  process.exit(1);
});
