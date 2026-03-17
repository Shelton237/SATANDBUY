"use strict";

const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const Customer = require("../models/Customer");
const tokenService = require("../services/tokenService");
const mailer = require("../lib/mailer");
const { CLIENT } = require("../constants/userTypes");
const { buildAuthResponse } = require("../utils/response");

const normalizeSearchText = (value = "") =>
  typeof value === "string" ? value.trim() : "";

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
      id: customer._id,
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      address: customer.address,
      phone: customer.phone,
      image: customer.image,
      role: customer.role || CLIENT,
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
        id: existing._id,
        _id: existing._id,
        name: existing.name,
        email: existing.email,
        address: existing.address,
        phone: existing.phone,
        image: existing.image,
        role: existing.role || CLIENT,
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
      id: customer._id,
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      address: customer.address,
      phone: customer.phone,
      image: customer.image,
      role: customer.role || CLIENT,
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
      id: customer._id,
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      address: customer.address,
      phone: customer.phone,
      image: customer.image,
      role: customer.role || CLIENT,
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
      id: customer._id,
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      address: customer.address,
      phone: customer.phone,
      image: customer.image,
      role: customer.role || CLIENT,
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
      id: customer._id,
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      address: customer.address,
      phone: customer.phone,
      image: customer.image,
      role: customer.role || CLIENT,
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

const addAllCustomers = async (req, res, next) => {
  try {
    if (!Array.isArray(req.body) || !req.body.length) {
      throw createError(400, "Une liste de clients est requise.");
    }
    await Customer.deleteMany({});
    await Customer.insertMany(req.body);
    res.send({ message: "Clients importÃ©s avec succÃ¨s." });
  } catch (err) {
    next(err);
  }
};

const listCustomers = async (req, res, next) => {
  try {
    const searchText = normalizeSearchText(req.query.searchText);
    const filter = {};
    if (searchText) {
      const regex = new RegExp(searchText, "i");
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }
    const customers = await Customer.find(filter).sort({ createdAt: -1 }).lean();
    res.send(customers);
  } catch (err) {
    next(err);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    if (!customer) {
      throw createError(404, "Client introuvable.");
    }
    res.send(customer);
  } catch (err) {
    next(err);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { name, email, address, phone, image } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      throw createError(404, "Client introuvable.");
    }

    if (email && email !== customer.email) {
      const existing = await Customer.findOne({ email });
      if (existing && existing.id !== customer.id) {
        throw createError(400, "Cet email est dÃ©jÃ  utilisÃ©.");
      }
    }

    customer.name = name ?? customer.name;
    customer.email = email ?? customer.email;
    customer.address = address ?? customer.address;
    customer.phone = phone ?? customer.phone;
    customer.image = image ?? customer.image;
    customer.role = customer.role || CLIENT;

    const updated = await customer.save();
    const token = jwt.sign(
      { _id: updated._id, email: updated.email, role: updated.role || CLIENT },
      process.env.JWT_SECRET
    );

    res.send({
      token,
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      address: updated.address,
      phone: updated.phone,
      image: updated.image,
      role: updated.role || CLIENT,
      message: "Client mis Ã  jour avec succÃ¨s.",
    });
  } catch (err) {
    next(err);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const result = await Customer.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      throw createError(404, "Client introuvable.");
    }
    res.send({ message: "Client supprimÃ©." });
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
  addAllCustomers,
  listCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
