"use strict";

const createError = require("http-errors");
const Post = require("../models/Post");
const PostLike = require("../models/PostLike");
const Boutique = require("../models/Boutique");

const assertBoutiqueOwner = async (userId) => {
  const boutique = await Boutique.findOne({ owner: userId, status: "active" });
  if (!boutique) throw createError(403, "Vous devez avoir une boutique active pour poster.");
  return boutique;
};

const createPost = async (req, res, next) => {
  try {
    const authorId = req.user._id || req.user.id;
    const boutique = await assertBoutiqueOwner(authorId);

    const { content, images, type } = req.body;
    if (!content || !content.trim()) throw createError(400, "Le contenu du post est requis.");

    const post = await Post.create({
      boutiqueId: boutique._id,
      author: authorId,
      content: content.trim(),
      images: images || [],
      type: type || "post",
      status: "published",
    });

    await Boutique.findByIdAndUpdate(boutique._id, { $inc: { postsCount: 1 } });

    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authorId = req.user._id || req.user.id;

    const post = await Post.findById(id);
    if (!post) throw createError(404, "Post introuvable.");
    if (post.author.toString() !== authorId.toString()) {
      throw createError(403, "Vous n'êtes pas l'auteur de ce post.");
    }

    const { content, images, type, status, pinned } = req.body;
    if (content !== undefined) post.content = content.trim();
    if (images !== undefined) post.images = images;
    if (type !== undefined) post.type = type;
    if (status !== undefined) post.status = status;
    if (pinned !== undefined) post.pinned = pinned;

    await post.save();
    res.json({ post });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authorId = req.user._id || req.user.id;

    const post = await Post.findById(id);
    if (!post) throw createError(404, "Post introuvable.");
    if (post.author.toString() !== authorId.toString()) {
      throw createError(403, "Non autorisé.");
    }

    await Post.findByIdAndDelete(id);
    await Boutique.findByIdAndUpdate(post.boutiqueId, { $inc: { postsCount: -1 } });

    res.json({ message: "Post supprimé." });
  } catch (err) {
    next(err);
  }
};

const getBoutiquePosts = async (req, res, next) => {
  try {
    const { boutiqueId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      Post.find({ boutiqueId, status: "published" })
        .sort({ pinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Post.countDocuments({ boutiqueId, status: "published" }),
    ]);

    // Enrichir avec les likes du user courant
    let likedPostIds = [];
    if (req.user) {
      const customerId = req.user._id || req.user.id;
      const userLikes = await PostLike.find({
        postId: { $in: posts.map((p) => p._id) },
        customerId,
      });
      likedPostIds = userLikes.map((l) => l.postId.toString());
    }

    const enriched = posts.map((p) => ({
      ...p.toObject(),
      likedByMe: likedPostIds.includes(p._id.toString()),
    }));

    res.json({
      posts: enriched,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

const getMyBoutiquePosts = async (req, res, next) => {
  try {
    const authorId = req.user._id || req.user.id;
    const boutique = await Boutique.findOne({ owner: authorId });
    if (!boutique) throw createError(404, "Boutique introuvable.");

    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query = { boutiqueId: boutique._id };
    if (status) query.status = status;

    const [posts, total] = await Promise.all([
      Post.find(query).sort({ pinned: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Post.countDocuments(query),
    ]);

    res.json({ posts, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

const likePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customerId = req.user._id || req.user.id;

    const post = await Post.findById(id);
    if (!post) throw createError(404, "Post introuvable.");

    const existing = await PostLike.findOne({ postId: id, customerId });
    if (existing) {
      await PostLike.deleteOne({ postId: id, customerId });
      await Post.findByIdAndUpdate(id, { $inc: { likesCount: -1 } });
      return res.json({ liked: false, likesCount: post.likesCount - 1 });
    }

    await PostLike.create({ postId: id, customerId });
    await Post.findByIdAndUpdate(id, { $inc: { likesCount: 1 } });
    res.json({ liked: true, likesCount: post.likesCount + 1 });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getBoutiquePosts,
  getMyBoutiquePosts,
  likePost,
};
