const express = require("express");
const router = express.Router();
const { isAuth, isAdmin } = require("../middleware/auth");
const marketListController =
  require("@satandbuy/catalog-domain").controllers.marketList;
const {
  createMarketList,
  getMarketLists,
  getAdminMarketLists,
  updateMarketListStatus,
  updateMarketList,
} = marketListController;

router.post("/", isAuth, createMarketList);
router.get("/", isAuth, getMarketLists);

router.get("/admin", isAuth, isAdmin, getAdminMarketLists);
router.patch("/:id/status", isAuth, isAdmin, updateMarketListStatus);
router.put("/:id", isAuth, updateMarketList);

module.exports = router;
