"use strict";

const fs = require("fs");
const path = require("path");
const mongo = require("../../packages/shared/src/mongo/connection");

const ROOT_DIR = path.resolve(__dirname, "../..");

const CONNECTIONS = {
  auth: {
    label: "auth-service",
    envPath: "services/auth-service/.env",
    fallbackUri: "mongodb://127.0.0.1:27017/satandbuy_auth",
    dbName: "satandbuy_auth",
  },
  catalog: {
    label: "catalog-service",
    envPath: "services/catalog-service/.env",
    fallbackUri: "mongodb://127.0.0.1:27018/satandbuy_catalog",
    overrideUri: "mongodb://127.0.0.1:27018/satandbuy_catalog",
    dbName: "satandbuy_catalog",
  },
  order: {
    label: "order-service",
    envPath: "services/order-service/.env",
    fallbackUri: "mongodb://127.0.0.1:27017/satandbuy_orders",
    dbName: "satandbuy_orders",
  },
};

const parseEnvFile = (relativePath) => {
  const absolutePath = path.resolve(ROOT_DIR, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return {};
  }
  const content = fs.readFileSync(absolutePath, "utf8");
  return content.split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return acc;
    }
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return acc;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    acc[key] = value;
    return acc;
  }, {});
};

const normalizeUri = (uri, dbName) => {
  if (!uri) {
    return "";
  }
  if (uri.includes("?")) {
    return uri;
  }
  if (uri.split("/").length > 3) {
    return uri;
  }
  return `${uri.replace(/\/$/, "")}/${dbName}`;
};

const withServiceDatabase = async (serviceKey, task) => {
  const config = CONNECTIONS[serviceKey];
  if (!config) {
    throw new Error(`No database configuration found for service "${serviceKey}"`);
  }

  const env = parseEnvFile(config.envPath);
  const dbName = env.MONGO_DB || config.dbName;
  const preferredUri =
    process.env.SEED_USE_SERVICE_URI === "true"
      ? env.MONGO_URI || env.MONGO_URL
      : config.overrideUri || env.MONGO_URI || env.MONGO_URL;
  const uri = normalizeUri(preferredUri || config.fallbackUri, dbName);

  await mongo.createMongoConnection(uri, { dbName });
  try {
    await task();
  } finally {
    await mongo.mongoose.disconnect();
  }
};

module.exports = {
  CONNECTIONS,
  withServiceDatabase,
};
