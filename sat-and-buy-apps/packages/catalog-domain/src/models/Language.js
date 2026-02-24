"use strict";

const mongoose = require("../lib/mongoose");

const languageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    iso_code: {
      type: String,
      required: true,
    },
    flag: {
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
  mongoose.models.Language || mongoose.model("Language", languageSchema);
