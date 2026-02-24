const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const { signInToken } = require("../config/auth");
const Admin = require("../models/Admin");
const { STAFF_ROLES } = require("../constants/roles");
const { DEFAULT_DRIVER_SLOTS } = require("../constants/delivery");
const {
  normalizeDateOnly,
  getTakenSlotsForDriver,
} = require("../lib/delivery/driverBooking");

const sanitizeAdmin = (admin) => {
  if (!admin) return admin;
  const plain = admin.toObject ? admin.toObject() : { ...admin };
  delete plain.password;
  return plain;
};

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
  if (Array.isArray(currentSlots) && currentSlots.length) {
    return currentSlots;
  }
  return [...DEFAULT_DRIVER_SLOTS];
};

const addStaff = async (req, res) => {
  // console.log("add staf....", req.body.staffData);
  try {
    const isAdded = await Admin.findOne({ email: req.body.email });
    if (isAdded) {
      return res.status(500).send({
        message: "This Email already Added!",
      });
    } else {
      const normalizedSlots = resolveDriverSlots(
        req.body.availabilitySlots,
        req.body.role
      );
      const newStaff = new Admin({
        name: { ...req.body.name },
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password),
        phone: req.body.phone,
        joiningDate: req.body.joiningDate,
        role: req.body.role,
        image: req.body.image,
        availabilitySlots: normalizedSlots,
      });
      const savedStaff = await newStaff.save();
      res.status(201).send({
        message: "Staff Added Successfully!",
        staff: sanitizeAdmin(savedStaff),
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
    // console.log("error", err);
  }
};

const getAllStaff = async (req, res) => {
  // console.log('allamdin')
  try {
    const admins = await Admin.find({}).sort({ _id: -1 });
    res.send(admins.map(sanitizeAdmin));
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getStaffById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    res.send(sanitizeAdmin(admin));
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateStaff = async (req, res) => {
  try {
    const admin = await Admin.findOne({ _id: req.params.id });

    if (admin) {
      admin.name = { ...admin.name, ...req.body.name };
      admin.email = req.body.email;
      admin.phone = req.body.phone;
      admin.role = req.body.role;
      admin.joiningData = req.body.joiningDate;
      admin.availabilitySlots = resolveDriverSlots(
        req.body.availabilitySlots,
        admin.role,
        admin.availabilitySlots
      );
      // admin.password =
      //   req.body.password !== undefined
      //     ? bcrypt.hashSync(req.body.password)
      //     : admin.password;

      admin.image = req.body.image;
      const updatedAdmin = await admin.save();
      const token = signInToken(updatedAdmin);
      res.send({
        token,
        message: "Staff Updated Successfully!",
        staff: sanitizeAdmin(updatedAdmin),
      });
    } else {
      res.status(404).send({
        message: "This Staff not found!",
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const deleteStaff = (req, res) => {
  Admin.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      res.status(500).send({
        message: err.message,
      });
    } else {
      res.status(200).send({
        message: "Admin Deleted Successfully!",
      });
    }
  });
};

const updatedStatus = async (req, res) => {
  try {
    const newStatus = req.body.status;

    await Admin.updateOne(
      { _id: req.params.id },
      {
        $set: {
          status: newStatus,
        },
      }
    );
    const staff = await Admin.findById(req.params.id);
    res.send({
      message: `Staff ${newStatus} Successfully!`,
      staff: sanitizeAdmin(staff),
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getDriverAvailability = async (req, res) => {
  try {
    const driver = await Admin.findById(req.params.id);
    if (!driver || driver.role !== "Livreur") {
      return res.status(404).send({ message: "Livreur introuvable." });
    }

    const { date, orderId } = req.query;
    if (!date) {
      return res
        .status(400)
        .send({ message: "Le paramètre date est requis." });
    }

    const normalizedDate = normalizeDateOnly(date);
    if (!normalizedDate) {
      return res.status(400).send({ message: "Date invalide." });
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
    res.status(500).send({ message: err.message });
  }
};

module.exports = {
  addStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  updatedStatus,
  getDriverAvailability,
};
