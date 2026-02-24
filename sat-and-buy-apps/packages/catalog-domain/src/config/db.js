"use strict";

/**
 * This stub keeps legacy controllers (ported from the monolith)
 * happy even though the real shared Mongo connection now lives
 * in @satandbuy/shared. Controllers no longer use `mongo_connection`,
 * but the require() was still present.
 */
module.exports = {
  mongo_connection: null,
};
