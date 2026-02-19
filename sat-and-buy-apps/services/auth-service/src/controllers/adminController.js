"use strict";

const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const { STAFF_ROLES } = require("@satandbuy/shared").constants.roles;
const { DEFAULT_DRIVER_SLOTS } =
  require("@satandbuy/shared").constants.delivery;
const mailer = require("../lib/mailer");
const tokenService = require("../services/tokenService");
const refreshTokens = require("../services/refreshTokenService");
const { ADMIN } = require("../constants/userTypes");
const { buildAuthResponse, sanitizeAdmin } = require("../utils/response");

const normalizeSlots = (slots = []) =>
  Array.isArray(slots)
    ? slots
        .map((slot) => (typeof slot === "string" ? slot.trim() : ""))
        .filter(Boolean)
    : [];

const resolveDriverSlots = (incomingSlots, role, currentSlots = []) => {
  if (role !== "Livreur") {
    return [];
  }
  const normalized = normalizeSlots(incomingSlots);
  if (normalized.length) {
    return normalized;
  }
  if (currentSlots && currentSlots.length) {
    return currentSlots;
  }
  return [...DEFAULT_DRIVER_SLOTS];
};

const login = async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      throw createError(401, "Invalid email or password.");
    }
    const valid = admin.password
      ? bcrypt.compareSync(req.body.password, admin.password)
      : false;
    if (!valid) {
      throw createError(401, "Invalid email or password.");
    }
    if (!STAFF_ROLES.includes(admin.role)) {
      throw createError(
        403,
        "Access denied: this user is not allowed to access the admin console."
      );
    }

    const payload = await buildAuthResponse(admin, ADMIN);
    res.send({
      ...payload,
      user: sanitizeAdmin(admin),
    });
  } catch (err) {
    next(err);
  }
};

const registerDirect = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      throw createError(400, "name, email, password et role sont requis.");
    }
    const existing = await Admin.findOne({ email });
    if (existing) {
      throw createError(409, "Cette adresse email existe déjà.");
    }

    const normalizedSlots = resolveDriverSlots(
      req.body.availabilitySlots,
      role
    );
    const normalizedName =
      typeof name === "string" ? { display: name } : { ...name };

    const admin = await Admin.create({
      name: normalizedName,
      email,
      role,
      password: bcrypt.hashSync(password),
      phone: req.body.phone,
      image: req.body.image,
      availabilitySlots: normalizedSlots,
    });

    const payload = await buildAuthResponse(admin, ADMIN);
    res.status(201).send({
      ...payload,
      user: sanitizeAdmin(admin),
      message: "Staff créé avec succès.",
    });
  } catch (err) {
    next(err);
  }
};

const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw createError(400, "Email requis.");
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw createError(404, "Aucun staff trouvé avec cet email.");
    }
    const token = tokenService.createVerifyToken(admin);
    await mailer.send({
      to: email,
      subject: "Réinitialisation de mot de passe (console)",
      html: `<p>Bonjour ${email},</p>
      <p>Utilisez ce lien pour réinitialiser votre mot de passe :</p>
      <p><a href="${process.env.ADMIN_URL}/reset-password/${token}">Réinitialiser</a></p>
      <p>Le lien expire dans 15 minutes.</p>`,
    });
    res.send({ message: "Email envoyé. Merci de vérifier votre boîte de réception." });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      throw createError(400, "Token et nouveau mot de passe requis.");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_FOR_VERIFY);
    const admin = await Admin.findOne({ email: decoded.email });
    if (!admin) {
      throw createError(404, "Staff introuvable.");
    }
    admin.password = bcrypt.hashSync(newPassword);
    await admin.save();
    res.send({ message: "Mot de passe mis à jour, vous pouvez vous connecter." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  registerDirect,
  forgetPassword,
  resetPassword,
};
