"use strict";

const mongoose = require("../lib/mongoose");

const postSchema = new mongoose.Schema(
  {
    boutiqueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    type: {
      type: String,
      enum: ["post", "offer", "event", "news"],
      default: "post",
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ boutiqueId: 1, createdAt: -1 });
postSchema.index({ status: 1 });

module.exports =
  mongoose.models.BoutiquePost || mongoose.model("BoutiquePost", postSchema);
