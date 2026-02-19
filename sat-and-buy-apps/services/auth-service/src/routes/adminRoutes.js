"use strict";

const router = require("express").Router();
const controller = require("../controllers/adminController");

router.post("/login", controller.login);
router.post("/register", controller.registerDirect);
router.put("/forget-password", controller.forgetPassword);
router.put("/reset-password", controller.resetPassword);

module.exports = router;
