"use strict";

const mongoose = require("../lib/mongoose");

const boutiqueOrderSchema = new mongoose.Schema(
  {
    boutiqueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: true,
    },
    catalogItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatalogItem",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    customerName: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    unitPrice: { type: Number, default: null },
    currency: { type: String, default: "FCFA" },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

boutiqueOrderSchema.index({ boutiqueId: 1, createdAt: -1 });
boutiqueOrderSchema.index({ customerId: 1, createdAt: -1 });

module.exports =
  mongoose.models.BoutiqueOrder || mongoose.model("BoutiqueOrder", boutiqueOrderSchema);
