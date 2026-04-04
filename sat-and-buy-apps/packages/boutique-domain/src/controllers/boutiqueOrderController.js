"use strict";

const createError = require("http-errors");
const BoutiqueOrder = require("../models/BoutiqueOrder");
const CatalogItem = require("../models/CatalogItem");
const Boutique = require("../models/Boutique");

// POST /boutique-catalog/orders — créer une commande (client connecté)
const createOrder = async (req, res, next) => {
  try {
    const customerId = req.user._id || req.user.id;
    const { catalogItemId, boutiqueId, quantity = 1, note = "" } = req.body;

    if (!catalogItemId) throw createError(400, "L'article est requis.");
    if (!boutiqueId) throw createError(400, "La boutique est requise.");
    if (quantity < 1) throw createError(400, "La quantité doit être ≥ 1.");

    const item = await CatalogItem.findOne({ _id: catalogItemId, featured: true, available: true });
    if (!item) throw createError(404, "Article introuvable ou non disponible.");

    const order = await BoutiqueOrder.create({
      boutiqueId,
      catalogItemId,
      customerId,
      customerName: req.user.name || "",
      customerEmail: req.user.email || "",
      customerPhone: req.user.phone || "",
      quantity: Number(quantity),
      unitPrice: item.price,
      currency: item.currency,
      note: note.trim(),
    });

    res.status(201).json({ order, message: "Commande créée avec succès." });
  } catch (err) {
    next(err);
  }
};

// GET /boutique-catalog/orders/me — mes commandes (client)
const getMyOrders = async (req, res, next) => {
  try {
    const customerId = req.user._id || req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      BoutiqueOrder.find({ customerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate({ path: "catalogItemId", select: "name images type price currency" })
        .populate({ path: "boutiqueId", select: "name slug logo" }),
      BoutiqueOrder.countDocuments({ customerId }),
    ]);

    res.json({ orders, total, page: Number(page) });
  } catch (err) {
    next(err);
  }
};

// GET /boutique-catalog/orders/boutique — commandes reçues par la boutique (owner)
const getBoutiqueOrders = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const boutique = await Boutique.findOne({ owner: userId, status: "active" });
    if (!boutique) throw createError(403, "Vous n'avez pas de boutique active.");

    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query = { boutiqueId: boutique._id };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      BoutiqueOrder.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate({ path: "catalogItemId", select: "name images type price currency" }),
      BoutiqueOrder.countDocuments(query),
    ]);

    res.json({ orders, total, page: Number(page) });
  } catch (err) {
    next(err);
  }
};

// PUT /boutique-catalog/orders/:id/status — mettre à jour le statut (owner ou admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "completed", "cancelled"];
    if (!allowed.includes(status)) throw createError(400, "Statut invalide.");

    const userId = req.user._id || req.user.id;
    const role = req.user.role?.toLowerCase();
    const isAdmin = ["admin", "trieur", "operations"].includes(role);

    const order = await BoutiqueOrder.findById(id);
    if (!order) throw createError(404, "Commande introuvable.");

    if (!isAdmin) {
      const boutique = await Boutique.findOne({ _id: order.boutiqueId, owner: userId });
      if (!boutique) throw createError(403, "Accès refusé.");
    }

    order.status = status;
    await order.save();
    res.json({ order, message: "Statut mis à jour." });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getBoutiqueOrders, updateOrderStatus };
