"use strict";

const mongoose = require("../lib/mongoose");

const currencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      lowercase: true,
      enum: ["show", "hide"],
      default: "show",
    },
    live_exchange_rates: {
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
  mongoose.models.Currency || mongoose.model("Currency", currencySchema);
