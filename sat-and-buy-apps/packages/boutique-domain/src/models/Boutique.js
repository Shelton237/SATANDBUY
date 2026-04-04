"use strict";

const mongoose = require("../lib/mongoose");

const BUSINESS_TYPES = [
  "medical",
  "it_services",
  "internet",
  "clothing",
  "food_beverages",
  "naturopathy",
  "education",
  "beauty",
  "real_estate",
  "transport",
  "other",
];

const boutiqueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    businessType: {
      type: String,
      enum: BUSINESS_TYPES,
      default: "other",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "Cameroun",
    },
    website: {
      type: String,
      default: "",
    },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    followersCount: {
      type: Number,
      default: 0,
    },
    postsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

boutiqueSchema.index({ slug: 1 });
boutiqueSchema.index({ owner: 1 });
boutiqueSchema.index({ status: 1 });
boutiqueSchema.index({ businessType: 1 });

module.exports =
  mongoose.models.Boutique || mongoose.model("Boutique", boutiqueSchema);
