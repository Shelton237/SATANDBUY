"use strict";

const router = require("express").Router();
const controller = require("../controllers/adminController");

router.post("/login", controller.login);
router.post("/register", controller.registerDirect);
router.put("/forget-password", controller.forgetPassword);
router.put("/reset-password", controller.resetPassword);
router.post("/add", controller.addStaff);
router.get("/", controller.getAllStaff);
router.get("/:id/availability", controller.getDriverAvailability);
router.put("/update-status/:id", controller.updateStatus);
router.get("/:id", controller.getStaffById);
router.put("/:id", controller.updateStaff);
router.delete("/:id", controller.deleteStaff);

module.exports = router;
