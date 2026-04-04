"use strict";

const mongoose = require("../lib/mongoose");

const catalogItemSchema = new mongoose.Schema(
  {
    boutiqueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      min: 0,
      default: null,
    },
    currency: {
      type: String,
      default: "FCFA",
    },
    images: {
      type: [String],
      default: [],
    },
    type: {
      type: String,
      enum: ["product", "service"],
      default: "product",
    },
    available: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    featuredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

catalogItemSchema.index({ boutiqueId: 1, createdAt: -1 });
catalogItemSchema.index({ featured: 1, featuredAt: -1 });

module.exports =
  mongoose.models.CatalogItem || mongoose.model("CatalogItem", catalogItemSchema);
