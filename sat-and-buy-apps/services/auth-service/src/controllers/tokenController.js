"use strict";

const createError = require("http-errors");

const refreshTokens = require("../services/refreshTokenService");
const { buildAuthResponse } = require("../utils/response");
const Admin = require("../models/Admin");
const Customer = require("../models/Customer");
const { ADMIN, CLIENT } = require("../constants/userTypes");

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw createError(400, "refreshToken requis.");
    }

    const stored = await refreshTokens.findValid(refreshToken);
    if (!stored) {
      throw createError(401, "Refresh token invalide ou expiré.");
    }

    const model = stored.userType === ADMIN ? Admin : Customer;
    const user = await model.findById(stored.user);
    if (!user) {
      await refreshTokens.revoke(refreshToken);
      throw createError(404, "Utilisateur introuvable.");
    }

    await refreshTokens.revoke(refreshToken);
    const payload = await buildAuthResponse(user, stored.userType);

    res.send({
      ...payload,
      user,
    });
  } catch (err) {
    next(err);
  }
};

const revoke = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw createError(400, "refreshToken requis.");
    }
    await refreshTokens.revoke(refreshToken);
    res.send({ message: "Refresh token révoqué." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  refresh,
  revoke,
};
