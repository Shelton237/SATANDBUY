"use strict";

const express = require("express");
const router = express.Router();
const { controllers } = require("@satandbuy/boutique-domain");
const { getBoutiqueItems, createItem, updateItem, deleteItem, adminListItems, toggleFeature, getFeaturedItems } = controllers.catalog;
const { isAuth, optionalAuth, isAdmin } = require("../middleware/auth");

// Articles mis en avant — public (doit être AVANT /:id pour éviter le conflit)
router.get("/featured", optionalAuth, getFeaturedItems);

// Articles d'une boutique — public
router.get("/boutique/:boutiqueId", optionalAuth, getBoutiqueItems);

// Admin — liste tous les articles
router.get("/admin", isAuth, isAdmin, adminListItems);

// Admin — valider / retirer la mise en avant
router.put("/:id/feature", isAuth, isAdmin, toggleFeature);

// CRUD article catalogue — propriétaire
router.post("/", isAuth, createItem);
router.put("/:id", isAuth, updateItem);
router.delete("/:id", isAuth, deleteItem);

module.exports = router;
