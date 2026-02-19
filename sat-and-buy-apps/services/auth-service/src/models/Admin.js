"use strict";

const mongoose = require("../lib/mongoose");
const bcrypt = require("bcryptjs");
const { STAFF_ROLES } = require("@satandbuy/shared").constants.roles;

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: Object,
      required: true,
    },
    image: String,
    address: String,
    country: String,
    city: String,
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: String,
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    password: {
      type: String,
      default: () => bcrypt.hashSync("12345678"),
    },
    role: {
      type: String,
      enum: STAFF_ROLES,
      default: STAFF_ROLES[0],
    },
    joiningDate: Date,
    availabilitySlots: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
