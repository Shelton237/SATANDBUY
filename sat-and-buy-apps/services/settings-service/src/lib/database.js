"use strict";

const { mongo } = require("@satandbuy/shared");

const connectDatabase = async () => {
  const uri = process.env.MONGO_URI;
  await mongo.createMongoConnection(uri, {
    dbName: process.env.MONGO_DB || undefined,
  });
  console.log("[settings-service] connected to Mongo");
};

module.exports = connectDatabase;
