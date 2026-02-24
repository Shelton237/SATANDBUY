"use strict";

const EVENTS = Object.freeze({
  ORDER_PLACED: "order.placed",
  ORDER_PAID: "order.paid",
  ORDER_STATUS_UPDATED: "order.status.updated",
  ORDER_DELIVERY_CONFIRMED: "order.delivery.confirmed",
});

module.exports = {
  EVENTS,
};
