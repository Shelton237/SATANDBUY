const express = require("express");
const router = express.Router();
const productController =
  require("@satandbuy/catalog-domain").controllers.product;
const { isAuth, isAuthAny } = require("../middleware/auth");

const {
  addProduct,
  addAllProducts,
  getAllProducts,
  getShowingProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  updateManyProducts,
  updateStatus,
  updateApprovalStatus,
  deleteProduct,
  deleteManyProducts,
  getShowingStoreProducts,
  getMySubmissions,
  getBoutiqueStoreProducts,
} = productController;

// ─── PUBLIC ────────────────────────────────────────────────────────────────
// Produits visibles sur le store
router.get("/show", getShowingProducts);
router.get("/store", getShowingStoreProducts);
// Produits boutique validés (marketplace)
router.get("/store/boutique", getBoutiqueStoreProducts);
// Produit par slug
router.get("/product/:slug", getProductBySlug);

// ─── BOUTIQUE OWNER (client JWT) ───────────────────────────────────────────
// Soumettre un produit au store
router.post("/submit", isAuthAny, addProduct);
// Voir ses propres soumissions
router.get("/my-submissions", isAuthAny, getMySubmissions);
// Modifier un produit soumis (repasse à pending automatiquement)
router.put("/my-submissions/:id", isAuthAny, updateProduct);
// Supprimer un produit soumis
router.delete("/my-submissions/:id", isAuthAny, deleteProduct);

// ─── ADMIN / STAFF ─────────────────────────────────────────────────────────
router.post("/add", isAuth, addProduct);
router.post("/all", isAuth, addAllProducts);
router.post("/:id", isAuth, getProductById);
router.get("/", isAuth, getAllProducts);
router.get("/:id", isAuth, getProductById);
router.patch("/:id", isAuth, updateProduct);
router.patch("/update/many", isAuth, updateManyProducts);
router.put("/status/:id", isAuth, updateStatus);
router.put("/approval/:id", isAuth, updateApprovalStatus);
router.delete("/:id", isAuth, deleteProduct);
router.patch("/delete/many", isAuth, deleteManyProducts);

module.exports = router;
