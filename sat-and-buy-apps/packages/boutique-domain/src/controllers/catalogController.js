"use strict";

const createError = require("http-errors");
const CatalogItem = require("../models/CatalogItem");
const Boutique = require("../models/Boutique");

const assertOwner = async (userId) => {
  const boutique = await Boutique.findOne({ owner: userId, status: "active" });
  if (!boutique) throw createError(403, "Vous devez avoir une boutique active.");
  return boutique;
};

const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

const getBoutiqueItems = async (req, res, next) => {
  try {
    const { boutiqueId } = req.params;
    if (!isValidObjectId(boutiqueId)) {
      return res.json({ items: [], total: 0, page: 1, totalPages: 0 });
    }
    const { page = 1, limit = 20, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query = { boutiqueId };
    if (type) query.type = type;

    // Cacher les articles indisponibles aux non-propriétaires
    const userId = req.user?._id || req.user?.id;
    if (userId) {
      const owned = await Boutique.exists({ _id: boutiqueId, owner: userId });
      if (!owned) query.available = true;
    } else {
      query.available = true;
    }

    const [items, total] = await Promise.all([
      CatalogItem.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      CatalogItem.countDocuments(query),
    ]);

    res.json({ items, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

const createItem = async (req, res, next) => {
  try {
    const boutique = await assertOwner(req.user._id || req.user.id);
    const { name, description, price, currency, images, type, available } = req.body;
    if (!name || !name.trim()) throw createError(400, "Le nom est requis.");

    const item = await CatalogItem.create({
      boutiqueId: boutique._id,
      name: name.trim(),
      description: description?.trim() || "",
      price: price !== undefined && price !== "" ? Number(price) : null,
      currency: currency || "FCFA",
      images: images || [],
      type: type || "product",
      available: available !== undefined ? available : true,
    });

    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const boutique = await assertOwner(userId);

    const item = await CatalogItem.findOne({ _id: id, boutiqueId: boutique._id });
    if (!item) throw createError(404, "Article introuvable.");

    const { name, description, price, currency, images, type, available } = req.body;
    if (name !== undefined) item.name = name.trim();
    if (description !== undefined) item.description = description.trim();
    if (price !== undefined) item.price = price !== "" ? Number(price) : null;
    if (currency !== undefined) item.currency = currency;
    if (images !== undefined) item.images = images;
    if (type !== undefined) item.type = type;
    if (available !== undefined) item.available = available;

    await item.save();
    res.json({ item });
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const boutique = await assertOwner(userId);

    const item = await CatalogItem.findOne({ _id: id, boutiqueId: boutique._id });
    if (!item) throw createError(404, "Article introuvable.");

    await CatalogItem.findByIdAndDelete(id);
    res.json({ message: "Article supprimé." });
  } catch (err) {
    next(err);
  }
};

// ─── ADMIN ─────────────────────────────────────────────────────────────────

// GET /boutique-catalog/admin — liste tous les articles (admin)
const adminListItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, featured, type, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query = {};
    if (featured === "true") query.featured = true;
    if (featured === "false") query.featured = false;
    if (type) query.type = type;
    if (search) query.name = { $regex: search, $options: "i" };

    const [items, total] = await Promise.all([
      CatalogItem.find(query)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate({ path: "boutiqueId", select: "name slug logo owner businessType" }),
      CatalogItem.countDocuments(query),
    ]);

    res.json({ items, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

// PUT /boutique-catalog/:id/feature — valider ou retirer la mise en avant (admin)
const toggleFeature = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) throw createError(400, "ID invalide.");

    const item = await CatalogItem.findById(id);
    if (!item) throw createError(404, "Article introuvable.");

    item.featured = !item.featured;
    item.featuredAt = item.featured ? new Date() : null;
    await item.save();

    res.json({ item, message: item.featured ? "Article mis en avant." : "Mise en avant retirée." });
  } catch (err) {
    next(err);
  }
};

// ─── PUBLIC FEATURED ───────────────────────────────────────────────────────

// GET /boutique-catalog/featured — liste publique des articles mis en avant
const getFeaturedItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query = { featured: true, available: true };
    if (type) query.type = type;

    const [items, total] = await Promise.all([
      CatalogItem.find(query)
        .sort({ featuredAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate({ path: "boutiqueId", select: "name slug logo city businessType verified" }),
      CatalogItem.countDocuments(query),
    ]);

    res.json({ items, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBoutiqueItems, createItem, updateItem, deleteItem, adminListItems, toggleFeature, getFeaturedItems };
