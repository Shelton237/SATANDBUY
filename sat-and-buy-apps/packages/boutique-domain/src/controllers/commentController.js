"use strict";

const createError = require("http-errors");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Boutique = require("../models/Boutique");

const addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const authorId = req.user._id || req.user.id;
    const { content, parentId, commentAsBoutique } = req.body;

    if (!content || !content.trim()) throw createError(400, "Le contenu du commentaire est requis.");

    const post = await Post.findById(postId);
    if (!post) throw createError(404, "Post introuvable.");

    let boutiqueId = null;
    if (commentAsBoutique) {
      const boutique = await Boutique.findOne({ owner: authorId, status: "active" });
      if (boutique) boutiqueId = boutique._id;
    }

    const comment = await Comment.create({
      postId,
      author: authorId,
      authorName: req.user.name || "",
      authorImage: req.user.image || "",
      boutiqueId,
      content: content.trim(),
      parentId: parentId || null,
    });

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, { $inc: { repliesCount: 1 } });
    }

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
};

const getPostComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [comments, total] = await Promise.all([
      Comment.find({ postId, parentId: null })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Comment.countDocuments({ postId, parentId: null }),
    ]);

    res.json({
      comments,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

const getCommentReplies = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const replies = await Comment.find({ parentId: commentId }).sort({ createdAt: 1 });
    res.json({ replies });
  } catch (err) {
    next(err);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authorId = req.user._id || req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) throw createError(404, "Commentaire introuvable.");
    if (comment.author.toString() !== authorId.toString()) {
      throw createError(403, "Non autorisé.");
    }

    comment.content = (req.body.content || "").trim() || comment.content;
    await comment.save();
    res.json({ comment });
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authorId = req.user._id || req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) throw createError(404, "Commentaire introuvable.");

    // L'auteur ou le propriétaire de la boutique peut supprimer
    const isAuthor = comment.author.toString() === authorId.toString();
    let isBoutiqueOwner = false;
    if (comment.boutiqueId || comment.postId) {
      const post = await Post.findById(comment.postId);
      if (post) {
        const boutique = await Boutique.findOne({ _id: post.boutiqueId, owner: authorId });
        isBoutiqueOwner = !!boutique;
      }
    }

    if (!isAuthor && !isBoutiqueOwner) throw createError(403, "Non autorisé.");

    await Comment.findByIdAndDelete(id);
    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });

    if (comment.parentId) {
      await Comment.findByIdAndUpdate(comment.parentId, { $inc: { repliesCount: -1 } });
    }

    res.json({ message: "Commentaire supprimé." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addComment,
  getPostComments,
  getCommentReplies,
  updateComment,
  deleteComment,
};
