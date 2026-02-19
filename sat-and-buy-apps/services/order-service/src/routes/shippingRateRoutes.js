const express = require("express");
const router = express.Router();
const { isAuth } = require("../middleware/auth");
const shippingRateController =
  require("@satandbuy/order-domain").controllers.shippingRate;
const {
  createShippingRate,
  getShippingRates,
  updateShippingRate,
  deleteShippingRate,
  getPublicShippingRates,
} = shippingRateController;

router.get("/public", getPublicShippingRates);
router.get("/", isAuth, getShippingRates);
router.post("/", isAuth, createShippingRate);
router.put("/:id", isAuth, updateShippingRate);
router.delete("/:id", isAuth, deleteShippingRate);

module.exports = router;
