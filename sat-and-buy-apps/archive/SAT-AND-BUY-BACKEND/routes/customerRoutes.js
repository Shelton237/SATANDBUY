const express = require("express");
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addAllCustomers,
  addShippingAddress,
  getShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
} = require("../controller/customerController");

// shipping address send to array
router.post("/shipping/address/:id", addShippingAddress);

// get all shipping address
router.get("/shipping/address/:id", getShippingAddress);

// shipping address update
router.put("/shipping/address/:userId/:shippingId", updateShippingAddress);

// shipping address delete
router.delete("/shipping/address/:userId/:shippingId", deleteShippingAddress);

//add all users
router.post("/add/all", addAllCustomers);

//get all user
router.get("/", getAllCustomers);

//get a user
router.get("/:id", getCustomerById);

//update a user
router.put("/:id", updateCustomer);

//delete a user
router.delete("/:id", deleteCustomer);

module.exports = router;
