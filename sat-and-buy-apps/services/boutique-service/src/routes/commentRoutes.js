"use strict";

const express = require("express");
const router = express.Router();
const { controllers } = require("@satandbuy/boutique-domain");
const {
  addComment,
  getPostComments,
  getCommentReplies,
  updateComment,
  deleteComment,
} = controllers.comment;
const { isAuth } = require("../middleware/auth");

// Commentaires d'un post (public)
router.get("/post/:postId", getPostComments);
router.get("/:commentId/replies", getCommentReplies);

// CRUD commentaire (authentifié)
router.post("/post/:postId", isAuth, addComment);
router.put("/:id", isAuth, updateComment);
router.delete("/:id", isAuth, deleteComment);

module.exports = router;
