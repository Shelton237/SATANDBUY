"use strict";

const express = require("express");
const router = express.Router();
const { controllers } = require("@satandbuy/boutique-domain");
const {
  createBoutique,
  getMyBoutique,
  updateMyBoutique,
  getBoutiqueBySlug,
  listBoutiques,
  followBoutique,
  adminListBoutiques,
  adminUpdateBoutiqueStatus,
  adminDeleteBoutique,
} = controllers.boutique;
const { isAuth, optionalAuth, isAdmin } = require("../middleware/auth");

// Public - liste et détail
router.get("/", optionalAuth, listBoutiques);
router.get("/slug/:slug", optionalAuth, getBoutiqueBySlug);

// Compte boutique (authentifié)
router.post("/", isAuth, createBoutique);
router.get("/me", isAuth, getMyBoutique);
router.put("/me", isAuth, updateMyBoutique);
router.post("/:id/follow", isAuth, followBoutique);

// Admin
router.get("/admin/list", isAuth, isAdmin, adminListBoutiques);
router.put("/admin/:id/status", isAuth, isAdmin, adminUpdateBoutiqueStatus);
router.delete("/admin/:id", isAuth, isAdmin, adminDeleteBoutique);

module.exports = router;
