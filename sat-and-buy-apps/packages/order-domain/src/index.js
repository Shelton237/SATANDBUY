"use strict";

const models = {
  Order: require("./models/Order"),
  ShippingRate: require("./models/ShippingRate"),
  Admin: require("./models/Admin"),
  Setting: require("./models/Setting"),
};

const controllers = {
  order: require("./controllers/orderController"),
  customerOrder: require("./controllers/customerOrderController"),
  shippingRate: require("./controllers/shippingRateController"),
};

const lib = {
  stripe: require("./lib/stripe/stripe"),
};

module.exports = {
  models,
  controllers,
  lib,
};
