"use strict";

const mongoose = require("../lib/mongoose");

const couponSchema = new mongoose.Schema(
  {
    title: {
      type: Object,
      required: true,
    },
    logo: {
      type: String,
      required: false,
    },
    couponCode: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: false,
    },
    endTime: {
      type: Date,
      required: true,
    },
    discountType: {
      type: Object,
      required: false,
    },
    minimumAmount: {
      type: Number,
      required: true,
    },
    productType: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      lowercase: true,
      enum: ["show", "hide"],
      default: "show",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
