"use strict";

const express = require("express");
const router = express.Router();
const { controllers } = require("@satandbuy/boutique-domain");
const {
  createPost,
  updatePost,
  deletePost,
  getBoutiquePosts,
  getMyBoutiquePosts,
  likePost,
} = controllers.post;
const { isAuth, optionalAuth } = require("../middleware/auth");

// Posts d'une boutique (public)
router.get("/boutique/:boutiqueId", optionalAuth, getBoutiquePosts);

// Mes posts (propriétaire boutique)
router.get("/me", isAuth, getMyBoutiquePosts);

// CRUD post
router.post("/", isAuth, createPost);
router.put("/:id", isAuth, updatePost);
router.delete("/:id", isAuth, deletePost);

// Like/Unlike
router.post("/:id/like", isAuth, likePost);

module.exports = router;
