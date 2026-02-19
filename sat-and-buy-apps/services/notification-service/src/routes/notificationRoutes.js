"use strict";

const router = require("express").Router();
const notificationControllers =
  require("@satandbuy/notification-domain").controllers;

const {
  getAllNotification,
  addNotification,
  updateStatusNotification,
  deleteNotificationById,
  deleteNotificationByProductId,
  deleteManyNotification,
  updateManyStatusNotification,
} = notificationControllers;

router.post("/add", addNotification);
router.get("/", getAllNotification);
router.put("/:id", updateStatusNotification);
router.patch("/update/many", updateManyStatusNotification);
router.delete("/:id", deleteNotificationById);
router.delete("/product-id/:id", deleteNotificationByProductId);
router.patch("/delete/many", deleteManyNotification);

module.exports = router;
