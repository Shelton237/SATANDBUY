"use strict";

const mongoose = require("../lib/mongoose");

const postLikeSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BoutiquePost",
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

postLikeSchema.index({ postId: 1, customerId: 1 }, { unique: true });

module.exports =
  mongoose.models.PostLike || mongoose.model("PostLike", postLikeSchema);
