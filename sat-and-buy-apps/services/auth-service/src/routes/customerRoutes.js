"use strict";

const router = require("express").Router();
const controller = require("../controllers/customerController");

router.get("/", controller.listCustomers);
router.get("/:id", controller.getCustomerById);
router.put("/:id", controller.updateCustomer);
router.delete("/:id", controller.deleteCustomer);
router.post("/add/all", controller.addAllCustomers);

router.post("/login", controller.login);
router.post("/verify-email", controller.requestEmailVerification);
router.post("/register", controller.registerDirect);
router.post("/register/:token", controller.registerViaToken);
router.post("/signup/oauth", controller.oauthSignup);
router.post("/signup/:token", controller.signupWithProviderToken);
router.put("/forget-password", controller.forgetPassword);
router.put("/reset-password", controller.resetPassword);
router.post("/change-password", controller.changePassword);

module.exports = router;
