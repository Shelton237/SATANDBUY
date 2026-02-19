"use strict";

const { sanitizeAdmin } = require("./sanitize");
const tokenService = require("../services/tokenService");
const refreshTokens = require("../services/refreshTokenService");

const ACCESS_TOKEN_TTL = process.env.JWT_EXPIRES_IN || "1d";

const buildAuthResponse = async (user, userType) => {
  const token = tokenService.createAccessToken(user);
  const refreshToken = await refreshTokens.issue(user, userType);

  return {
    token,
    tokenType: "Bearer",
    expiresIn: ACCESS_TOKEN_TTL,
    refreshToken: refreshToken.token,
    refreshTokenExpiresAt: refreshToken.expiresAt,
  };
};

const sanitizeUser = (user, userType) => {
  if (!user) return user;
  if (userType === "admin") {
    return sanitizeAdmin(user);
  }
  return user;
};

module.exports = {
  buildAuthResponse,
  sanitizeUser,
  sanitizeAdmin,
};
