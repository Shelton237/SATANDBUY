"use strict";

const crypto = require("crypto");
const createError = require("http-errors");

const RefreshToken = require("../models/RefreshToken");

const REFRESH_TOKEN_TTL_DAYS = parseInt(
  process.env.REFRESH_TOKEN_TTL_DAYS || "30",
  10
);

const ttlMs = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

const generateToken = () => crypto.randomBytes(48).toString("hex");

const issue = async (user, userType) => {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + ttlMs);
  await RefreshToken.create({
    user: user._id,
    userType,
    token,
    expiresAt,
  });
  return {
    token,
    expiresAt,
  };
};

const findValid = async (token) => {
  if (!token) return null;
  return RefreshToken.findOne({
    token,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
};

const revoke = async (token) => {
  if (!token) return;
  await RefreshToken.updateOne(
    { token },
    {
      $set: {
        revokedAt: new Date(),
      },
    }
  );
};

module.exports = {
  issue,
  findValid,
  revoke,
};
