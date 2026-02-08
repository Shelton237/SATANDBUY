const express = require("express");
const router = express.Router();
const { isAuth, isAdmin } = require("../config/auth");
const {
  createMarketList,
  getMarketLists,
  getAdminMarketLists,
  updateMarketListStatus,
  updateMarketList,
} = require("../controller/marketListController");

router.post("/", isAuth, createMarketList);
router.get("/", isAuth, getMarketLists);

router.get("/admin", isAuth, isAdmin, getAdminMarketLists);
router.patch("/:id/status", isAuth, isAdmin, updateMarketListStatus);
router.put("/:id", isAuth, updateMarketList);

module.exports = router;
