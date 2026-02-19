"use strict";

const shared = require("@satandbuy/shared");

if (!shared?.mongo?.mongoose) {
  throw new Error(
    "@satandbuy/auth-service requires @satandbuy/shared.mongo.mongoose to be available"
  );
}

module.exports = shared.mongo.mongoose;
