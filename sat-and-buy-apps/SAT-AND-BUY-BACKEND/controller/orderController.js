const mongoose = require("mongoose");
const Order = require("../models/Order");
const Admin = require("../models/Admin");
const {
  normalizeDateOnly,
  releaseDriverSlotsByOrder,
  ensureDriverBooking,
  getTakenSlotsForDriver,
  parseSlotRange,
} = require("../lib/delivery/driverBooking");

const SORTING_ITEM_STATUSES = ["Pending", "Checked", "Missing"];
const ORDER_BOARD_STATUSES = [
  "Pending",
  "Sorting",
  "ReadyForDelivery",
  "Processing",
  "Delivered",
  "Cancel",
];

const buildSortingItems = (cart = []) =>
  cart.map((item = {}) => ({
    productId:
      item.productId ||
      item._id?.toString?.() ||
      item.id ||
      item.sku ||
      "",
    title: item.title || item.name || "",
    sku: item.sku || "",
    image: Array.isArray(item.image) ? item.image?.[0] : item.image || "",
    quantity: item.quantity || 1,
    status: "Pending",
  }));

const getAllOrders = async (req, res) => {
  const {
    day,
    status,
    page,
    limit,
    method,
    endDate,
    // download,
    // sellFrom,
    startDate,
    customerName,
    driverId,
  } = req.query;

  //  day count
  let date = new Date();
  const today = date.toString();
  date.setDate(date.getDate() - Number(day));
  const dateTime = date.toString();

  const beforeToday = new Date();
  beforeToday.setDate(beforeToday.getDate() - 1);
  // const before_today = beforeToday.toString();

  const startDateData = new Date(startDate);
  startDateData.setDate(startDateData.getDate());
  const start_date = startDateData.toString();

  // console.log(" start_date", start_date, endDate);

  const queryObject = {};

  if (!status) {
    queryObject.$or = [
      { status: { $regex: `Pending`, $options: "i" } },
      { status: { $regex: `Sorting`, $options: "i" } },
      { status: { $regex: `ReadyForDelivery`, $options: "i" } },
      { status: { $regex: `Processing`, $options: "i" } },
      { status: { $regex: `Delivered`, $options: "i" } },
      { status: { $regex: `Cancel`, $options: "i" } },
    ];
  }

  if (customerName) {
    queryObject.$or = [
      { "user_info.name": { $regex: `${customerName}`, $options: "i" } },
      { invoice: { $regex: `${customerName}`, $options: "i" } },
    ];
  }

  if (day) {
    queryObject.createdAt = { $gte: dateTime, $lte: today };
  }

  if (status) {
    queryObject.status = { $regex: `${status}`, $options: "i" };
  }

  if (startDate && endDate) {
    queryObject.updatedAt = {
      $gt: start_date,
      $lt: endDate,
    };
  }
  if (method) {
    queryObject.paymentMethod = { $regex: `${method}`, $options: "i" };
  }

  if (driverId) {
    const normalizedDriver = driverId.toString().trim();
    if (mongoose.Types.ObjectId.isValid(normalizedDriver)) {
      queryObject["deliveryPlan.driverId"] = normalizedDriver;
    } else {
      queryObject["deliveryPlan.assignedDriver"] = {
        $regex: `${normalizedDriver}`,
        $options: "i",
      };
    }
  }

  const pages = Number(page) || 1;
  const limits = Number(limit);
  const skip = (pages - 1) * limits;

  try {
    // total orders count
    const totalDoc = await Order.countDocuments(queryObject);
    const orders = await Order.find(queryObject)
      .select(
        "_id invoice paymentMethod subTotal total user_info discount shippingCost status createdAt updatedAt deliveryPlan"
      )
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limits);

    let methodTotals = [];
    if (startDate && endDate) {
      // console.log("filter method total");
      const filteredOrders = await Order.find(queryObject, {
        _id: 1,
        // subTotal: 1,
        total: 1,

        paymentMethod: 1,
        // createdAt: 1,
        updatedAt: 1,
      }).sort({ updatedAt: -1 });
      for (const order of filteredOrders) {
        const { paymentMethod, total } = order;
        const existPayment = methodTotals.find(
          (item) => item.method === paymentMethod
        );

        if (existPayment) {
          existPayment.total += total;
        } else {
          methodTotals.push({
            method: paymentMethod,
            total: total,
          });
        }
      }
    }

    res.send({
      orders,
      limits,
      pages,
      totalDoc,
      methodTotals,
      // orderOverview,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getOrderCustomer = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id }).sort({ _id: -1 });
    res.send(orders);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    res.send(order);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const newStatus = req.body.status;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send({ message: "Order not found!" });
    }
    order.status = newStatus;
    await order.save();
    if (["Cancel", "Delivered"].includes(newStatus)) {
      await releaseDriverSlotsByOrder(order._id, `status:${newStatus}`);
    }
    res.send({
      message: "Order Updated Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send({ message: "Order not found!" });
    }
    await releaseDriverSlotsByOrder(order._id, "order_deleted");
    await order.deleteOne();
    res.send({
      message: "Order Deleted Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const startSorting = async (req, res) => {
  try {
    const { sorterId, notes } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send({ message: "Order not found!" });
    }

    const now = new Date();
    const existingItems = Array.isArray(order.sorting?.items)
      ? order.sorting.items
      : [];
    const sortingItems =
      existingItems.length > 0
        ? existingItems
        : buildSortingItems(order.cart || []);

    order.sorting = {
      ...(order.sorting || {}),
      assignedTo: sorterId || order.sorting?.assignedTo || null,
      notes:
        typeof notes === "string"
          ? notes
          : order.sorting?.notes || "",
      status: "InProgress",
      startedAt: order.sorting?.startedAt || now,
      items: sortingItems,
    };
    order.status = "Sorting";

    await order.save();
    res.send({
      message: "Sorting started successfully!",
      order,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const completeSorting = async (req, res) => {
  try {
    const { notes } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send({ message: "Order not found!" });
    }

    if (
      !order.sorting ||
      !Array.isArray(order.sorting.items) ||
      order.sorting.items.length === 0
    ) {
      return res.status(400).send({
        message: "Aucun produit Ã  vÃ©rifier. Veuillez d'abord dÃ©marrer le tri.",
      });
    }

    const pendingItem = order.sorting.items.find(
      (item) => item.status === "Pending"
    );
    if (pendingItem) {
      return res.status(400).send({
        message:
          "Tous les produits doivent Ãªtre cochÃ©s (prÃ©sents ou manquants) avant de terminer le tri.",
      });
    }

    const now = new Date();
    order.sorting = {
      ...(order.sorting || {}),
      status: "Completed",
      completedAt: now,
      startedAt: order.sorting?.startedAt || now,
      notes:
        typeof notes === "string"
          ? notes
          : order.sorting?.notes || "",
    };
    order.status = "ReadyForDelivery";

    await order.save();
    res.send({
      message: "Sorting completed successfully!",
      order,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const updateSortingItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { status, notes, checkerId } = req.body;

    if (!SORTING_ITEM_STATUSES.includes(status)) {
      return res.status(400).send({ message: "Statut de tri invalide." });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).send({ message: "Order not found!" });
    }

    if (!order.sorting || !Array.isArray(order.sorting.items)) {
      return res.status(400).send({
        message: "Le tri n'a pas encore Ã©tÃ© dÃ©marrÃ© pour cette commande.",
      });
    }

    const targetItem = order.sorting.items.id(itemId);
    if (!targetItem) {
      return res
        .status(404)
        .send({ message: "Produit introuvable dans la checklist." });
    }

    targetItem.status = status;
    if (typeof notes === "string") {
      targetItem.notes = notes;
    }

    if (status === "Pending") {
      targetItem.checkedBy = null;
      targetItem.checkedAt = null;
    } else {
      if (checkerId) {
        targetItem.checkedBy = checkerId;
      }
      targetItem.checkedAt = new Date();
    }

    await order.save();
    res.send({
      message: "Produit de la checklist mis Ã  jour.",
      item: targetItem,
      order,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const normalizeStatuses = (statuses = []) => {
  const lowerMap = ORDER_BOARD_STATUSES.reduce((acc, status) => {
    acc[status.toLowerCase()] = status;
    return acc;
  }, {});
  const unique = [];
  statuses.forEach((status) => {
    const normalized =
      lowerMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
    if (!unique.includes(normalized)) {
      unique.push(normalized);
    }
  });
  return unique;
};

const getOrdersBoard = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const requestedStatuses = req.query.statuses
      ? req.query.statuses
          .split(",")
          .map((status) => status.trim())
          .filter(Boolean)
      : ORDER_BOARD_STATUSES;

    const statuses = normalizeStatuses(requestedStatuses);
    const board = {};

    for (const status of statuses) {
      const orders = await Order.find({ status })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .select(
          "_id invoice user_info total sorting deliveryPlan status updatedAt createdAt"
        )
        .lean();
      board[status] = orders;
    }

    res.send({
      statuses,
      board,
      limit,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const updateDeliveryPlan = async (req, res) => {
  try {
    const {
      assignedDriver,
      deliveryDate,
      deliveryWindow,
      notes,
      deliveryStatus,
      status,
      driverId,
    } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send({ message: "Order not found!" });
    }

    const plan = order.deliveryPlan || {};
    const effectiveDriverId = driverId || plan.driverId;
    if (!effectiveDriverId) {
      return res
        .status(400)
        .send({ message: "Veuillez sélectionner un livreur." });
    }

    const driver = await Admin.findById(effectiveDriverId);
    if (!driver || driver.role !== "Livreur") {
      return res.status(400).send({ message: "Livreur invalide." });
    }

    if (deliveryDate) {
      plan.deliveryDate = new Date(deliveryDate);
    } else if (!plan.deliveryDate) {
      return res
        .status(400)
        .send({ message: "La date de livraison est requise." });
    }

    if (deliveryWindow !== undefined) {
      plan.deliveryWindow = deliveryWindow;
    }
    if (!plan.deliveryWindow) {
      return res
        .status(400)
        .send({ message: "Le créneau horaire est requis." });
    }

    const normalizedDate = normalizeDateOnly(plan.deliveryDate);
    if (!normalizedDate) {
      return res
        .status(400)
        .send({ message: "Date de livraison invalide." });
    }

    let slotRange;
    try {
      slotRange = parseSlotRange(plan.deliveryWindow);
    } catch (rangeError) {
      return res
        .status(400)
        .send({ message: rangeError.message || "Cr?neau invalide." });
    }

    const taken = await getTakenSlotsForDriver({
      driverId: driver._id,
      date: normalizedDate,
      excludeOrderId: order._id,
    });
    const overlaps = taken.some(
      (booking) =>
        booking.startMinutes < slotRange.endMinutes &&
        booking.endMinutes > slotRange.startMinutes
    );
    if (overlaps) {
      return res
        .status(409)
        .send({ message: "Ce cr?neau est d?j? r?serv? pour ce livreur." });
    }

    const driverDisplayName =
      assignedDriver ||
      plan.assignedDriver ||
      (typeof driver.name === "object"
        ? driver.name.fr ||
          driver.name.en ||
          Object.values(driver.name)[0]
        : driver.name || driver.email);

    plan.assignedDriver = driverDisplayName;
    plan.driverId = driver._id;
    plan.notes = notes !== undefined ? notes : plan.notes;
    plan.status = deliveryStatus || plan.status || "Scheduled";
    order.deliveryPlan = plan;

    order.status =
      status ||
      (order.status === "ReadyForDelivery"
        ? "Processing"
        : order.status || "Processing");

    await order.save();
    await ensureDriverBooking({
      orderId: order._id,
      driverId: driver._id,
      date: normalizedDate,
      slot: plan.deliveryWindow,
    });

    res.send({
      message: "Delivery plan updated successfully!",
      order,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).send({ message: err.message });
  }
};

// get dashboard recent order
const getDashboardRecentOrder = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const pages = Number(page) || 1;
    const limits = Number(limit) || 8;
    const skip = (pages - 1) * limits;

    const queryObject = {};

    queryObject.$or = [
      { status: { $regex: `Pending`, $options: "i" } },
      { status: { $regex: `Sorting`, $options: "i" } },
      { status: { $regex: `ReadyForDelivery`, $options: "i" } },
      { status: { $regex: `Processing`, $options: "i" } },
      { status: { $regex: `Delivered`, $options: "i" } },
      { status: { $regex: `Cancel`, $options: "i" } },
    ];

    const totalDoc = await Order.countDocuments(queryObject);

    // query for orders
    const orders = await Order.find(queryObject)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limits);

    // console.log('order------------<', orders);

    res.send({
      orders: orders,
      page: page,
      limit: limit,
      totalOrder: totalDoc,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// get dashboard count
const getDashboardCount = async (req, res) => {
  try {
    const totalDoc = await Order.countDocuments();

    // total padding order count
    const totalPendingOrder = await Order.aggregate([
      {
        $match: {
          status: "Pending",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const totalSortingOrder = await Order.aggregate([
      {
        $match: {
          status: "Sorting",
        },
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // total processing order count (includes ready for delivery workflow)
    const totalProcessingOrder = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Processing", "ReadyForDelivery"] },
        },
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const totalReadyForDeliveryOrder = await Order.aggregate([
      {
        $match: {
          status: "ReadyForDelivery",
        },
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // total delivered order count
    const totalDeliveredOrder = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    res.send({
      totalOrder: totalDoc,
      totalPendingOrder: totalPendingOrder[0] || 0,
      totalSortingOrder: totalSortingOrder[0]?.count || 0,
      totalProcessingOrder: totalProcessingOrder[0]?.count || 0,
      totalReadyForDeliveryOrder: totalReadyForDeliveryOrder[0]?.count || 0,
      totalDeliveredOrder: totalDeliveredOrder[0]?.count || 0,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getDashboardAmount = async (req, res) => {
  // console.log('total')
  let week = new Date();
  week.setDate(week.getDate() - 10);

  const currentDate = new Date();
  currentDate.setDate(1); // Set the date to the first day of the current month
  currentDate.setHours(0, 0, 0, 0); // Set the time to midnight

  const lastMonthStartDate = new Date(currentDate); // Copy the current date
  lastMonthStartDate.setMonth(currentDate.getMonth() - 1); // Subtract one month

  let lastMonthEndDate = new Date(currentDate); // Copy the current date
  lastMonthEndDate.setDate(0); // Set the date to the last day of the previous month
  lastMonthEndDate.setHours(23, 59, 59, 999); // Set the time to the end of the day

  try {
    // total order amount
    const totalAmount = await Order.aggregate([
      {
        $group: {
          _id: null,
          tAmount: {
            $sum: "$total",
          },
        },
      },
    ]);
    // console.log('totalAmount',totalAmount)
    const thisMonthOrderAmount = await Order.aggregate([
      {
        $project: {
          year: { $year: "$updatedAt" },
          month: { $month: "$updatedAt" },
          total: 1,
          subTotal: 1,
          discount: 1,
          updatedAt: 1,
          createdAt: 1,
          status: 1,
        },
      },
      {
        $match: {
          $or: [{ status: { $regex: "Delivered", $options: "i" } }],
          year: { $eq: new Date().getFullYear() },
          month: { $eq: new Date().getMonth() + 1 },
          // $expr: {
          //   $eq: [{ $month: "$updatedAt" }, { $month: new Date() }],
          // },
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$updatedAt",
            },
          },
          total: {
            $sum: "$total",
          },
          subTotal: {
            $sum: "$subTotal",
          },

          discount: {
            $sum: "$discount",
          },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    const lastMonthOrderAmount = await Order.aggregate([
      {
        $project: {
          year: { $year: "$updatedAt" },
          month: { $month: "$updatedAt" },
          total: 1,
          subTotal: 1,
          discount: 1,
          updatedAt: 1,
          createdAt: 1,
          status: 1,
        },
      },
      {
        $match: {
          $or: [{ status: { $regex: "Delivered", $options: "i" } }],

          updatedAt: { $gt: lastMonthStartDate, $lt: lastMonthEndDate },
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$updatedAt",
            },
          },
          total: {
            $sum: "$total",
          },
          subTotal: {
            $sum: "$subTotal",
          },

          discount: {
            $sum: "$discount",
          },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    // console.log("thisMonthlyOrderAmount ===>", thisMonthlyOrderAmount);

    // order list last 10 days
    const orderFilteringData = await Order.find(
      {
        $or: [{ status: { $regex: `Delivered`, $options: "i" } }],
        updatedAt: {
          $gte: week,
        },
      },

      {
        paymentMethod: 1,
        paymentDetails: 1,
        total: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );

    res.send({
      totalAmount:
        totalAmount.length === 0
          ? 0
          : parseFloat(totalAmount[0].tAmount).toFixed(2),
      thisMonthlyOrderAmount: thisMonthOrderAmount[0]?.total,
      lastMonthOrderAmount: lastMonthOrderAmount[0]?.total,
      ordersData: orderFilteringData,
    });
  } catch (err) {
    // console.log('err',err)
    res.status(500).send({
      message: err.message,
    });
  }
};

const bestSellerProductChart = async (req, res) => {
  try {
    const totalDoc = await Order.countDocuments({});
    const bestSellingProduct = await Order.aggregate([
      {
        $unwind: "$cart",
      },
      {
        $group: {
          _id: "$cart.title",

          count: {
            $sum: "$cart.quantity",
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 4,
      },
    ]);

    res.send({
      totalDoc,
      bestSellingProduct,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getDashboardOrders = async (req, res) => {
  const { page, limit } = req.query;

  const pages = Number(page) || 1;
  const limits = Number(limit) || 8;
  const skip = (pages - 1) * limits;

  let week = new Date();
  week.setDate(week.getDate() - 10);

  const start = new Date().toDateString();

  // (startDate = '12:00'),
  //   (endDate = '23:59'),
  // console.log("page, limit", page, limit);

  try {
    const totalDoc = await Order.countDocuments({});

    // query for orders
    const orders = await Order.find({})
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limits);

    const totalAmount = await Order.aggregate([
      {
        $group: {
          _id: null,
          tAmount: {
            $sum: "$total",
          },
        },
      },
    ]);

    // total order amount
    const todayOrder = await Order.find({ createdAt: { $gte: start } });

    // this month order amount
    const totalAmountOfThisMonth = await Order.aggregate([
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
          },
          total: {
            $sum: "$total",
          },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    // total padding order count
    const totalPendingOrder = await Order.aggregate([
      {
        $match: {
          status: "Pending",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // sorting in progress
    const totalSortingOrder = await Order.aggregate([
      {
        $match: {
          status: "Sorting",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // ready or processing orders
    const totalProcessingOrder = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Processing", "ReadyForDelivery"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // total delivered order count
    const totalDeliveredOrder = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    //weekly sale report
    // filter order data
    const weeklySaleReport = await Order.find({
      $or: [{ status: { $regex: `Delivered`, $options: "i" } }],
      createdAt: {
        $gte: week,
      },
    });

    res.send({
      totalOrder: totalDoc,
      totalAmount:
        totalAmount.length === 0
          ? 0
          : parseFloat(totalAmount[0].tAmount).toFixed(2),
      todayOrder: todayOrder,
      totalAmountOfThisMonth:
        totalAmountOfThisMonth.length === 0
          ? 0
          : parseFloat(totalAmountOfThisMonth[0].total).toFixed(2),
      totalPendingOrder:
        totalPendingOrder.length === 0 ? 0 : totalPendingOrder[0],
      totalSortingOrder:
        totalSortingOrder.length === 0 ? 0 : totalSortingOrder[0],
      totalProcessingOrder:
        totalProcessingOrder.length === 0 ? 0 : totalProcessingOrder[0],
      totalDeliveredOrder:
        totalDeliveredOrder.length === 0 ? 0 : totalDeliveredOrder[0],
      orders,
      weeklySaleReport,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrderCustomer,
  updateOrder,
  deleteOrder,
  startSorting,
  completeSorting,
  updateSortingItem,
  updateDeliveryPlan,
  getOrdersBoard,
  bestSellerProductChart,
  getDashboardOrders,
  getDashboardRecentOrder,
  getDashboardCount,
  getDashboardAmount,
};
