"use strict";

const Setting = require("./models/Setting");
const controllers = require("./controllers/settingController");

module.exports = {
  models: {
    Setting,
  },
  controllers,
};
