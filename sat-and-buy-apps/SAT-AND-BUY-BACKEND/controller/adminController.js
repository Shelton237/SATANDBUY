const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const jwt = require("jsonwebtoken");
const { signInToken, tokenForVerify, sendEmail } = require("../config/auth");
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

const registerAdmin = async (req, res) => {
  try {
    const isAdded = await Admin.findOne({ email: req.body.email });
    if (isAdded) {
      return res.status(403).send({
        message: "This Email already Added!",
      });
    } else {
      const normalizedSlots = resolveDriverSlots(
        req.body.availabilitySlots,
        req.body.role
      );
      const newStaff = new Admin({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: bcrypt.hashSync(req.body.password),
        availabilitySlots: normalizedSlots,
      });
      const staff = await newStaff.save();
      const token = signInToken(staff);
      res.send({
        token,
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        joiningData: Date.now(),
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (admin && bcrypt.compareSync(req.body.password, admin.password)) {
      if (!STAFF_ROLES.includes(admin.role)) {
        return res.status(403).send({
          message:
            "Access denied: this user is not authorized to use the admin console. Please use the client portal.",
        });
      }
      const token = signInToken(admin);
      res.send({
        token,
        _id: admin._id,
        name: admin.name,
        phone: admin.phone,
        email: admin.email,
        image: admin.image,
        role: admin.role,
      });
    } else {
      res.status(401).send({
        message: "Invalid Email or password!",
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const forgetPassword = async (req, res) => {
  const isAdded = await Admin.findOne({ email: req.body.verifyEmail });
  if (!isAdded) {
    return res.status(404).send({
      message: "Admin/Staff Not found with this email!",
    });
  } else {
    const token = tokenForVerify(isAdded);
    const body = {
      from: process.env.EMAIL_USER,
      to: `${req.body.verifyEmail}`,
      subject: "Password Reset",
      html: `<h2>Hello ${req.body.verifyEmail}</h2>
      <p>A request has been received to change the password for your <strong>Kachabazar</strong> account </p>

        <p>This link will expire in <strong> 15 minute</strong>.</p>

        <p style="margin-bottom:20px;">Click this link for reset your password</p>

        <a href=${process.env.ADMIN_URL}/reset-password/${token}  style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Reset Password </a>

        
        <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@kachabazar.com</p>

        <p style="margin-bottom:0px;">Thank you</p>
        <strong>Kachabazar Team</strong>
             `,
    };
    const message = "Please check your email to reset password!";
    sendEmail(body, res, message);
  }
};

const resetPassword = async (req, res) => {
  const token = req.body.token;
  const { email } = jwt.decode(token);
  const staff = await Admin.findOne({ email: email });

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_FOR_VERIFY, (err, decoded) => {
      if (err) {
        return res.status(500).send({
          message: "Token expired, please try again!",
        });
      } else {
        staff.password = bcrypt.hashSync(req.body.newPassword);
        staff.save();
        res.send({
          message: "Your password change successful, you can login now!",
        });
      }
    });
  }
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
  registerAdmin,
  loginAdmin,
  forgetPassword,
  resetPassword,
  addStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  updatedStatus,
  getDriverAvailability,
};
