"use strict";

const jwt = require("jsonwebtoken");
const { CLIENT_ROLE } = require("../constants/roles");

const resolveRole = (user) => {
  if (!user) return CLIENT_ROLE;
  if (typeof user.role === "string") return user.role;
  return CLIENT_ROLE;
};

const buildPayload = (user = {}) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  address: user.address,
  phone: user.phone,
  image: user.image,
  role: resolveRole(user),
});

const signToken = (payload, { secret, expiresIn }) => {
  if (!secret) {
    throw new Error("JWT secret requis pour signer un token");
  }
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn || "1d",
  });
};

const createAccessToken = (user, options = {}) => {
  const payload = buildPayload(user);
  return signToken(payload, options);
};

const createVerifyToken = (user, options = {}) => {
  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    password: user.password,
  };
  return signToken(payload, options);
};

module.exports = {
  resolveRole,
  createAccessToken,
  createVerifyToken,
};
