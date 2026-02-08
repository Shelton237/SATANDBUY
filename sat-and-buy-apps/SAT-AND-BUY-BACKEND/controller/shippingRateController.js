const ShippingRate = require("../models/ShippingRate");

const APPROVAL_STATUSES = ["pending", "approved", "rejected"];

const isLogisticUser = (user = {}) => {
  const role = user?.role;
  return role === "Livreur" || role === "Admin";
};

const isAdminUser = (user = {}) => user?.role === "Admin";

const normalizeText = (value = "") =>
  typeof value === "string" ? value.trim() : "";

const normalizeApprovalStatus = (status, fallback = "pending") => {
  if (!status) return fallback;
  const normalized = status.toLowerCase();
  return APPROVAL_STATUSES.includes(normalized) ? normalized : fallback;
};

const RATE_POPULATE_PATHS = [
  { path: "createdBy", select: "name email role" },
  { path: "approvedBy", select: "name email role" },
];

const populateRateQuery = (query) => query.populate(RATE_POPULATE_PATHS);
const populateRateDoc = (doc) => doc.populate(RATE_POPULATE_PATHS);

const createShippingRate = async (req, res) => {
  if (!isLogisticUser(req.user)) {
    return res.status(403).send({
      message: "Access denied. Logistic role required.",
    });
  }

  try {
    const isAdmin = isAdminUser(req.user);
    const requestedApproval = normalizeApprovalStatus(
      req.body.approvalStatus,
      isAdmin ? "approved" : "pending"
    );

    const payload = {
      country: normalizeText(req.body.country),
      city: normalizeText(req.body.city),
      label: normalizeText(req.body.label),
      description: req.body.description,
      estimatedTime: req.body.estimatedTime,
      cost: Number(req.body.cost) || 0,
      status: req.body.status === "inactive" ? "inactive" : "active",
      approvalStatus: requestedApproval,
      createdBy: req.user?._id,
    };

    if (payload.approvalStatus === "approved") {
      payload.approvedBy = req.user?._id;
      payload.approvedAt = new Date();
    }

    if (!payload.country || !payload.city || !payload.label) {
      return res.status(400).send({
        message: "Country, city and label are required.",
      });
    }

    const rate = await ShippingRate.create(payload);
    await populateRateDoc(rate);
    res.send(rate);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getShippingRates = async (req, res) => {
  if (!isLogisticUser(req.user)) {
    return res.status(403).send({
      message: "Access denied.",
    });
  }

  try {
    const { country, city, status, approvalStatus } = req.query;
    const query = {};

    if (!isAdminUser(req.user)) {
      query.createdBy = req.user?._id;
    }

    if (country) query.country = new RegExp(country, "i");
    if (city) query.city = new RegExp(city, "i");
    if (status && ["active", "inactive"].includes(status)) {
      query.status = status;
    }
    if (approvalStatus) {
      query.approvalStatus = normalizeApprovalStatus(approvalStatus);
    }

    const rates = await populateRateQuery(
      ShippingRate.find(query).sort({ country: 1, city: 1, label: 1 })
    );

    res.send(rates);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const updateShippingRate = async (req, res) => {
  if (!isLogisticUser(req.user)) {
    return res.status(403).send({
      message: "Access denied.",
    });
  }

  try {
    const rate = await ShippingRate.findById(req.params.id);
    if (!rate) {
      return res.status(404).send({
        message: "Shipping rate not found.",
      });
    }

    const isAdmin = isAdminUser(req.user);
    const isOwner =
      rate.createdBy?.toString() === req.user?._id?.toString?.();

    if (!isAdmin && !isOwner) {
      return res.status(403).send({
        message: "You can only modify your own shipping rates.",
      });
    }

    if (req.body.country !== undefined) {
      rate.country = normalizeText(req.body.country);
    }
    if (req.body.city !== undefined) {
      rate.city = normalizeText(req.body.city);
    }
    if (req.body.label !== undefined) {
      rate.label = normalizeText(req.body.label);
    }
    if (req.body.description !== undefined) {
      rate.description = req.body.description;
    }
    if (req.body.estimatedTime !== undefined) {
      rate.estimatedTime = req.body.estimatedTime;
    }
    if (req.body.cost !== undefined) {
      rate.cost = Number(req.body.cost) || 0;
    }
    if (req.body.status !== undefined) {
      rate.status = req.body.status === "inactive" ? "inactive" : "active";
    }

    if (isAdmin && req.body.approvalStatus !== undefined) {
      const nextStatus = normalizeApprovalStatus(
        req.body.approvalStatus,
        rate.approvalStatus
      );
      rate.approvalStatus = nextStatus;
      if (nextStatus === "approved") {
        rate.approvedBy = req.user?._id;
        rate.approvedAt = new Date();
      } else {
        rate.approvedBy = undefined;
        rate.approvedAt = undefined;
      }
    } else if (!isAdmin) {
      rate.approvalStatus = "pending";
      rate.approvedBy = undefined;
      rate.approvedAt = undefined;
    }

    await rate.save();
    await populateRateDoc(rate);
    res.send(rate);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const deleteShippingRate = async (req, res) => {
  if (!isLogisticUser(req.user)) {
    return res.status(403).send({
      message: "Access denied.",
    });
  }

  try {
    const rate = await ShippingRate.findById(req.params.id);
    if (!rate) {
      return res.status(404).send({
        message: "Shipping rate not found.",
      });
    }

    const isAdmin = isAdminUser(req.user);
    const isOwner =
      rate.createdBy?.toString() === req.user?._id?.toString?.();

    if (!isAdmin && !isOwner) {
      return res.status(403).send({
        message: "You can only delete your own shipping rates.",
      });
    }

    await rate.deleteOne();
    res.send({ message: "Shipping rate deleted successfully." });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getPublicShippingRates = async (req, res) => {
  try {
    const { country, city } = req.query;
    const query = { status: "active", approvalStatus: "approved" };
    if (country) {
      query.country = new RegExp(`^${country}$`, "i");
    }
    if (city) {
      query.city = new RegExp(`^${city}$`, "i");
    }

    const rates = await ShippingRate.find(query)
      .sort({ cost: 1 })
      .select(
        "country city label description estimatedTime cost approvalStatus"
      );

    res.send({ rates });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = {
  createShippingRate,
  getShippingRates,
  updateShippingRate,
  deleteShippingRate,
  getPublicShippingRates,
};
