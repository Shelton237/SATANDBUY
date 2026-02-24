"use strict";

const mongoose = require("../lib/mongoose");
const { CLIENT_ROLE } = require("@satandbuy/shared").constants.roles;

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: String,
    address: String,
    country: String,
    city: String,
    shippingAddress: {
      type: Object,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: String,
    password: String,
    role: {
      type: String,
      enum: [CLIENT_ROLE],
      default: CLIENT_ROLE,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);
