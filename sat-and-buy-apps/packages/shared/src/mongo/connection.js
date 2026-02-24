"use strict";

const mongoose = require("mongoose");

const DEFAULT_OPTIONS = {
  autoIndex: true,
};

/**
 * Initialise ou récupère une connexion Mongo Mongoose.
 * @param {string} uri
 * @param {object} [options]
 * @returns {Promise<typeof mongoose>}
 */
async function createMongoConnection(uri, options = {}) {
  if (!uri) {
    throw new Error("MONGO_URI manquant pour createMongoConnection");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  await mongoose.connect(uri, {
    ...DEFAULT_OPTIONS,
    ...options,
  });

  return mongoose;
}

/**
 * Expose helpers so downstream packages can reuse the exact same
 * mongoose instance (and its active connections) instead of creating
 * isolated copies that never get connected.
 */
const getMongoConnection = () => mongoose.connection;

module.exports = {
  createMongoConnection,
  getMongoConnection,
  mongoose,
};
