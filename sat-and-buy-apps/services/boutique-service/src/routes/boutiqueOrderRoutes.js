"use strict";

const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getBoutiqueOrders,
  updateOrderStatus,
} = require("@satandbuy/boutique-domain").controllers.boutiqueOrder;
const { isAuth } = require("../middleware/auth");

// Client — créer une commande
router.post("/", isAuth, createOrder);

// Client — mes commandes
router.get("/me", isAuth, getMyOrders);

// Owner — commandes reçues par sa boutique
router.get("/boutique", isAuth, getBoutiqueOrders);

// Owner / Admin — changer le statut d'une commande
router.put("/:id/status", isAuth, updateOrderStatus);

module.exports = router;
