const mongoose = require("mongoose");

const marketListItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productTitle: {
      type: String,
      required: true,
    },
    productSlug: {
      type: String,
    },
    productImage: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    desiredPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const marketListSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    name: {
      type: String,
      default: "Liste de marché",
    },
    note: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "validated", "cancelled"],
      default: "pending",
    },
    items: {
      type: [marketListItemSchema],
      default: [],
    },
    totalValue: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const MarketList = mongoose.model("MarketList", marketListSchema);
module.exports = MarketList;
