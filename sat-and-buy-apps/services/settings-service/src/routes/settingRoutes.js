"use strict";

const router = require("express").Router();
const settingControllers =
  require("@satandbuy/settings-domain").controllers;

const {
  addGlobalSetting,
  getGlobalSetting,
  updateGlobalSetting,
  addStoreSetting,
  getStoreSetting,
  updateStoreSetting,
  getStoreSeoSetting,
  addStoreCustomizationSetting,
  getStoreCustomizationSetting,
  updateStoreCustomizationSetting,
} = settingControllers;

router.post("/global/add", addGlobalSetting);
router.get("/global/all", getGlobalSetting);
router.put("/global/update", updateGlobalSetting);

router.post("/store-setting/add", addStoreSetting);
router.get("/store-setting/all", getStoreSetting);
router.get("/store-setting/seo", getStoreSeoSetting);
router.put("/store-setting/update", updateStoreSetting);

router.post("/store/customization/add", addStoreCustomizationSetting);
router.get("/store/customization/all", getStoreCustomizationSetting);
router.put(
  "/store/customization/update",
  updateStoreCustomizationSetting
);

module.exports = router;
