"use strict";

require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./lib/database");
const shared = require("@satandbuy/shared");
const deliveryDomain = require("@satandbuy/delivery-domain");
const logger = shared.logger.createLogger({
  serviceName: "delivery-service",
});

const PORT = process.env.PORT || 5500;
const NATS_URL = process.env.NATS_URL || "nats://nats:4222";

const subscribeToEvents = () => {
  const { EVENTS: ORDER_EVENTS } = shared.events.orders;
  const bus = shared.events.bus;

  bus.subscribe(ORDER_EVENTS.ORDER_DELIVERY_CONFIRMED, async (payload = {}) => {
    try {
      await deliveryDomain.lib.releaseDriverSlotsByOrder(
        payload.orderId,
        "delivery_confirmed_event"
      );
    } catch (err) {
      logger.error(
        { err, event: ORDER_EVENTS.ORDER_DELIVERY_CONFIRMED },
        "unable to release slots via event"
      );
    }
  });
};

async function bootstrap() {
  await shared.telemetry.start({ serviceName: "delivery-service" });
  await connectDatabase();
  await shared.events.bus.connect(NATS_URL);
  subscribeToEvents();

  app.listen(PORT, () => {
    logger.info({ port: PORT }, "delivery-service listening");
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "delivery-service bootstrap failure");
  process.exit(1);
});
