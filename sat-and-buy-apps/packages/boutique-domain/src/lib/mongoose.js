"use strict";

const shared = require("@satandbuy/shared");

if (!shared || !shared.mongo || !shared.mongo.mongoose) {
  throw new Error(
    "@satandbuy/boutique-domain requires @satandbuy/shared.mongo.mongoose to be available"
  );
}

module.exports = shared.mongo.mongoose;
