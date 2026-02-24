"use strict";

const DriverBooking = require("./models/DriverBooking");
const driverBookingLib = require("./lib/driverBooking");

module.exports = {
  models: {
    DriverBooking,
  },
  lib: driverBookingLib,
};
