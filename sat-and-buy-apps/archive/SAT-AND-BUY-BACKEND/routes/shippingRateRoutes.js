const express = require("express");
const router = express.Router();
const { isAuth } = require("../config/auth");
const {
  createShippingRate,
  getShippingRates,
  updateShippingRate,
  deleteShippingRate,
  getPublicShippingRates,
} = require("../controller/shippingRateController");

router.get("/public", getPublicShippingRates);
router.get("/", isAuth, getShippingRates);
router.post("/", isAuth, createShippingRate);
router.put("/:id", isAuth, updateShippingRate);
router.delete("/:id", isAuth, deleteShippingRate);

module.exports = router;
