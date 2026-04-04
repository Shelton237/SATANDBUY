"use strict";

const mongoose = require("../lib/mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BoutiquePost",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    authorName: {
      type: String,
      default: "",
    },
    authorImage: {
      type: String,
      default: "",
    },
    // si l'auteur commente en tant que propriétaire de boutique
    boutiqueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      default: null,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    // commentaire parent pour les réponses imbriquées
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    repliesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ postId: 1, createdAt: 1 });
commentSchema.index({ parentId: 1 });

module.exports =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);
