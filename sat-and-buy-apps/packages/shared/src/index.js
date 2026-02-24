"use strict";

module.exports = {
  constants: {
    roles: require("./constants/roles"),
    delivery: require("./constants/delivery"),
  },
  events: {
    bus: require("./events/bus"),
    orders: require("./events/orders"),
  },
  auth: require("./security/token"),
  mongo: require("./mongo/connection"),
  logger: require("./logger"),
  telemetry: require("./telemetry"),
  metrics: require("./metrics"),
};
