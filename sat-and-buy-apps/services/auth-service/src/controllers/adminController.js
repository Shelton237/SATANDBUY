"use strict";

const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const shared = require("@satandbuy/shared");
const { STAFF_ROLES } = shared.constants.roles;
const { DEFAULT_DRIVER_SLOTS } = shared.constants.delivery;
const deliveryDomain = require("@satandbuy/delivery-domain");
const { normalizeDateOnly, getTakenSlotsForDriver } =
  (deliveryDomain && deliveryDomain.lib) || {};
const mailer = require("../lib/mailer");
const tokenService = require("../services/tokenService");
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

const normalizeName = (name) =>
  typeof name === "string" ? { display: name } : { ...name };

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
      throw createError(409, "Cette adresse email existe deja.");
    }

    const admin = await Admin.create({
      name: normalizeName(name),
      email,
      role,
      password: bcrypt.hashSync(password),
      phone: req.body.phone,
      image: req.body.image,
      availabilitySlots: resolveDriverSlots(
        req.body.availabilitySlots,
        role
      ),
    });

    const payload = await buildAuthResponse(admin, ADMIN);
    res.status(201).send({
      ...payload,
      user: sanitizeAdmin(admin),
      message: "Staff cree avec succes.",
    });
  } catch (err) {
    next(err);
  }
};

const addStaff = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      throw createError(400, "name, email, password et role sont requis.");
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      throw createError(409, "Cette adresse email existe deja.");
    }

    const admin = await Admin.create({
      name: normalizeName(name),
      email,
      password: bcrypt.hashSync(password),
      phone: req.body.phone,
      joiningDate: req.body.joiningDate,
      role,
      image: req.body.image,
      availabilitySlots: resolveDriverSlots(
        req.body.availabilitySlots,
        role
      ),
    });

    res.status(201).send({
      message: "Staff ajoute avec succes.",
      staff: sanitizeAdmin(admin),
    });
  } catch (err) {
    next(err);
  }
};

const getAllStaff = async (_req, res, next) => {
  try {
    const admins = await Admin.find({}).sort({ createdAt: -1 });
    res.send(admins.map(sanitizeAdmin));
  } catch (err) {
    next(err);
  }
};

const getStaffById = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      throw createError(404, "Staff introuvable.");
    }
    res.send(sanitizeAdmin(admin));
  } catch (err) {
    next(err);
  }
};

const updateStaff = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      throw createError(404, "Staff introuvable.");
    }

    if (req.body.email && req.body.email !== admin.email) {
      const conflict = await Admin.findOne({ email: req.body.email });
      if (conflict && conflict.id !== admin.id) {
        throw createError(409, "Cette adresse email existe deja.");
      }
      admin.email = req.body.email;
    }

    if (req.body.name) {
      admin.name = {
        ...admin.name,
        ...normalizeName(req.body.name),
      };
    }
    if (req.body.phone !== undefined) {
      admin.phone = req.body.phone;
    }
    if (req.body.role) {
      admin.role = req.body.role;
    }
    if (req.body.joiningDate !== undefined) {
      admin.joiningDate = req.body.joiningDate;
    }
    if (req.body.image !== undefined) {
      admin.image = req.body.image;
    }
    if (req.body.password) {
      admin.password = bcrypt.hashSync(req.body.password);
    }
    admin.availabilitySlots = resolveDriverSlots(
      req.body.availabilitySlots,
      admin.role,
      admin.availabilitySlots
    );

    const saved = await admin.save();
    res.send({
      message: "Staff mis a jour avec succes.",
      staff: sanitizeAdmin(saved),
    });
  } catch (err) {
    next(err);
  }
};

const deleteStaff = async (req, res, next) => {
  try {
    const deleted = await Admin.findByIdAndDelete(req.params.id);
    if (!deleted) {
      throw createError(404, "Staff introuvable.");
    }
    res.send({ message: "Staff supprime avec succes." });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["Active", "Inactive"].includes(status)) {
      throw createError(400, "Statut invalide.");
    }
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      throw createError(404, "Staff introuvable.");
    }
    admin.status = status;
    await admin.save();
    res.send({
      message: "Staff " + status + " avec succes.",
      staff: sanitizeAdmin(admin),
    });
  } catch (err) {
    next(err);
  }
};

const getDriverAvailability = async (req, res, next) => {
  try {
    if (!normalizeDateOnly || !getTakenSlotsForDriver) {
      throw createError(500, "Module de disponibilite indisponible.");
    }
    const driver = await Admin.findById(req.params.id);
    if (!driver || driver.role !== "Livreur") {
      throw createError(404, "Livreur introuvable.");
    }
    const { date, orderId } = req.query;
    if (!date) {
      throw createError(400, "Le parametre date est requis.");
    }
    const normalizedDate = normalizeDateOnly(date);
    if (!normalizedDate) {
      throw createError(400, "Date invalide.");
    }
    const baseSlots = resolveDriverSlots(
      driver.availabilitySlots,
      driver.role,
      driver.availabilitySlots
    );
    const taken = await getTakenSlotsForDriver({
      driverId: driver._id,
      date: normalizedDate,
      excludeOrderId: orderId,
    });
    const takenSet = new Set(taken.map((booking) => booking.slot));
    const available = baseSlots.filter((slot) => !takenSet.has(slot));
    res.send({
      slots: available,
      baseSlots,
      taken: taken.map((booking) => ({
        slot: booking.slot,
        order: booking.order,
        startMinutes: booking.startMinutes,
        endMinutes: booking.endMinutes,
      })),
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
      throw createError(404, "Aucun staff trouve avec cet email.");
    }
    const token = tokenService.createVerifyToken(admin);
    await mailer.send({
      to: email,
      subject: "Reinitialisation de mot de passe (console)",
      html: `<p>Bonjour ${email},</p>
      <p>Utilisez ce lien pour reinitialiser votre mot de passe :</p>
      <p><a href="${process.env.ADMIN_URL}/reset-password/${token}">Reinitialiser</a></p>
      <p>Le lien expire dans 15 minutes.</p>`,
    });
    res.send({
      message: "Email envoye. Merci de verifier votre boite de reception.",
    });
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
    res.send({
      message: "Mot de passe mis a jour, vous pouvez vous connecter.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  registerDirect,
  addStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  updateStatus,
  getDriverAvailability,
  forgetPassword,
  resetPassword,
};
