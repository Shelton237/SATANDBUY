"use strict";

const mongoose = require("../lib/mongoose");

const boutiqueFollowerSchema = new mongoose.Schema(
  {
    boutiqueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

boutiqueFollowerSchema.index({ boutiqueId: 1, customerId: 1 }, { unique: true });

module.exports =
  mongoose.models.BoutiqueFollower ||
  mongoose.model("BoutiqueFollower", boutiqueFollowerSchema);
