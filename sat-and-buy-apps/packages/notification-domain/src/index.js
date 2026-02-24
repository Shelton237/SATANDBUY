"use strict";

const Notification = require("./models/Notification");
const controllers = require("./controllers/notificationController");

module.exports = {
  models: {
    Notification,
  },
  controllers,
};
