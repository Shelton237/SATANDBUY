"use strict";

const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const Customer = require("../models/Customer");
const tokenService = require("../services/tokenService");
const mailer = require("../lib/mailer");
const { CLIENT } = require("../constants/userTypes");
const { buildAuthResponse } = require("../utils/response");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw createError(400, "Email et mot de passe requis.");
    }
    const customer = await Customer.findOne({ email });
    if (
      !customer ||
      !customer.password ||
      !bcrypt.compareSync(password, customer.password)
    ) {
      throw createError(401, "Identifiants invalides.");
    }

    const payload = await buildAuthResponse(customer, CLIENT);
    res.send({
      ...payload,
      user: customer,
    });
  } catch (err) {
    next(err);
  }
};

const requestEmailVerification = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw createError(400, "Nom, email et mot de passe requis.");
    }
    const existing = await Customer.findOne({ email });
    if (existing) {
      throw createError(409, "Cet email est déjà utilisé.");
    }
    const token = tokenService.createVerifyToken({ name, email, password });
    await mailer.send({
      to: email,
      subject: "Activation de votre compte Sat & Buy",
      html: `<p>Bonjour ${name || email},</p>
        <p>Veuillez confirmer votre adresse email en cliquant sur ce lien :</p>
        <p><a href="${process.env.STORE_URL}/verify/${token}">Activer mon compte</a></p>
        <p>Ce lien expire dans 15 minutes.</p>`,
    });
    res.send({ message: "Email de vérification envoyé." });
  } catch (err) {
    next(err);
  }
};

const registerViaToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) {
      throw createError(400, "Token requis.");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_FOR_VERIFY);
    const existing = await Customer.findOne({ email: decoded.email });
    if (existing) {
      const payload = await buildAuthResponse(existing, CLIENT);
      return res.send({
        ...payload,
        message: "Email déjà vérifié.",
        user: existing,
      });
    }
    const customer = await Customer.create({
      name: decoded.name,
      email: decoded.email,
      password: bcrypt.hashSync(decoded.password),
    });
    const payload = await buildAuthResponse(customer, CLIENT);
    res.status(201).send({
      ...payload,
      message: "Email vérifié, vous êtes connecté.",
      user: customer,
    });
  } catch (err) {
    next(err);
  }
};

const registerDirect = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw createError(400, "Nom, email et mot de passe requis.");
    }
    const existing = await Customer.findOne({ email });
    if (existing) {
      throw createError(409, "Cet email est déjà utilisé.");
    }
    const customer = await Customer.create({
      name,
      email,
      password: bcrypt.hashSync(password),
    });
    const payload = await buildAuthResponse(customer, CLIENT);
    res.status(201).send({
      ...payload,
      message: "Compte créé avec succès.",
      user: customer,
    });
  } catch (err) {
    next(err);
  }
};

const oauthSignup = async (req, res, next) => {
  try {
    const { name, email, image } = req.body;
    if (!email) {
      throw createError(400, "Email requis.");
    }
    let customer = await Customer.findOne({ email });
    if (!customer) {
      customer = await Customer.create({
        name: name || email,
        email,
        image,
      });
    }
    const payload = await buildAuthResponse(customer, CLIENT);
    res.send({
      ...payload,
      user: customer,
    });
  } catch (err) {
    next(err);
  }
};

const signupWithProviderToken = async (req, res, next) => {
  try {
    const user = jwt.decode(req.params.token);
    if (!user?.email) {
      throw createError(400, "Token invalide.");
    }
    let customer = await Customer.findOne({ email: user.email });
    if (!customer) {
      customer = await Customer.create({
        name: user.name || user.email,
        email: user.email,
        image: user.picture,
      });
    }
    const payload = await buildAuthResponse(customer, CLIENT);
    res.send({
      ...payload,
      user: customer,
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    if (!email || !currentPassword || !newPassword) {
      throw createError(400, "Email, mot de passe actuel et nouveau sont requis.");
    }

    const customer = await Customer.findOne({ email });
    if (!customer || !customer.password) {
      throw createError(
        403,
        "Pour changer de mot de passe, utilisez un compte créé avec email + mot de passe."
      );
    }
    const matches = bcrypt.compareSync(currentPassword, customer.password);
    if (!matches) {
      throw createError(401, "Mot de passe actuel invalide.");
    }
    customer.password = bcrypt.hashSync(newPassword);
    await customer.save();
    res.send({ message: "Mot de passe mis à jour." });
  } catch (err) {
    next(err);
  }
};

const forgetPassword = async (req, res, next) => {
  try {
    const email = req.body.email || req.body.verifyEmail;
    if (!email) {
      throw createError(400, "Email requis.");
    }
    const customer = await Customer.findOne({ email });
    if (!customer) {
      throw createError(404, "Aucun utilisateur trouvé.");
    }
    const token = tokenService.createVerifyToken(customer);
    await mailer.send({
      to: email,
      subject: "Réinitialisation de mot de passe",
      html: `<p>Bonjour ${customer.name || email},</p>
        <p>Cliquez pour réinitialiser votre mot de passe :</p>
        <p><a href="${process.env.STORE_URL}/auth/reset-password/${token}">Réinitialiser</a></p>`,
    });
    res.send({ message: "Email envoyé." });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      throw createError(400, "Token et mot de passe requis.");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_FOR_VERIFY);
    const customer = await Customer.findOne({ email: decoded.email });
    if (!customer) {
      throw createError(404, "Utilisateur introuvable.");
    }
    customer.password = bcrypt.hashSync(newPassword);
    await customer.save();
    res.send({ message: "Mot de passe mis à jour." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  requestEmailVerification,
  registerViaToken,
  registerDirect,
  oauthSignup,
  signupWithProviderToken,
  changePassword,
  forgetPassword,
  resetPassword,
};
