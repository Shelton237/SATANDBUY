const express = require("express");
const router = express.Router();
const { isAuth, isAuthAny } = require("../middleware/auth");
const customerOrderController =
  require("@satandbuy/order-domain").controllers.customerOrder;
const {
  addOrder,
  getOrderById,
  getOrderCustomer,
  createPaymentIntent,
  addRazorpayOrder,
  createOrderByRazorPay,
  getCustomerOrderBoard,
  confirmOrderDelivery,
  getBoutiqueOrders,
} = customerOrderController;

// Commandes reçues pour une boutique (propriétaire — customer JWT)
router.get("/boutique", isAuthAny, getBoutiqueOrders);

router.use(isAuth);

//add a order
router.post("/add", addOrder);

// create stripe payment intent
router.post("/create-payment-intent", createPaymentIntent);

//add razorpay order
router.post("/add/razorpay", addRazorpayOrder);

//add a order by razorpay
router.post("/create/razorpay", createOrderByRazorPay);

// get kanban board for connected customer
router.get("/board", getCustomerOrderBoard);

// confirm delivery
router.put("/:id/confirm-delivery", confirmOrderDelivery);

//get a order by id
router.get("/:id", getOrderById);

//get all order by a user
router.get("/", getOrderCustomer);

module.exports = router;
