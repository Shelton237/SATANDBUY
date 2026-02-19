const express = require("express");
const router = express.Router();
const productController =
  require("@satandbuy/catalog-domain").controllers.product;
const { isAuth } = require("../middleware/auth");

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
} = productController;

//get showing products only (public)
router.get("/show", getShowingProducts);

//get showing products in store (public)
router.get("/store", getShowingStoreProducts);

//get a product by slug (public)
router.get("/product/:slug", getProductBySlug);

// Protected routes for admin console / vendors
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
