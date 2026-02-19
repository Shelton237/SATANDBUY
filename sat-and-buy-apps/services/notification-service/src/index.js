"use strict";

require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./lib/database");
const shared = require("@satandbuy/shared");
const Notification =
  require("@satandbuy/notification-domain").models.Notification;
const logger = shared.logger.createLogger({
  serviceName: "notification-service",
});

const PORT = process.env.PORT || 5400;
const NATS_URL = process.env.NATS_URL || "nats://nats:4222";

const subscribeToEvents = () => {
  const { EVENTS: ORDER_EVENTS } = shared.events.orders;
  const bus = shared.events.bus;

  bus.subscribe(ORDER_EVENTS.ORDER_PLACED, async (payload = {}) => {
    try {
      await Notification.create({
        orderId: payload.orderId,
        message: `Nouvelle commande #${payload.orderId || ""}`,
        status: "unread",
      });
    } catch (err) {
      logger.error(
        { err, event: ORDER_EVENTS.ORDER_PLACED },
        "unable to store ORDER_PLACED"
      );
    }
  });
};

async function bootstrap() {
  await shared.telemetry.start({
    serviceName: "notification-service",
  });
  await connectDatabase();
  await shared.events.bus.connect(NATS_URL);
  subscribeToEvents();

  app.listen(PORT, () => {
    logger.info({ port: PORT }, "notification-service listening");
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "notification-service bootstrap failure");
  process.exit(1);
});
