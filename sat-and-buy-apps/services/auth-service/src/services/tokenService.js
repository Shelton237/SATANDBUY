"use strict";

const { auth } = require("@satandbuy/shared");

const ACCESS_TOKEN_EXPIRES = process.env.JWT_EXPIRES_IN || "1d";
const VERIFY_TOKEN_EXPIRES = process.env.JWT_VERIFY_EXPIRES_IN || "15m";

const createAccessToken = (user) =>
  auth.createAccessToken(user, {
    secret: process.env.JWT_SECRET,
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });

const createVerifyToken = (user) =>
  auth.createVerifyToken(user, {
    secret: process.env.JWT_SECRET_FOR_VERIFY,
    expiresIn: VERIFY_TOKEN_EXPIRES,
  });

module.exports = {
  createAccessToken,
  createVerifyToken,
};
