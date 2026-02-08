const Product = require("../models/Product");
const mongoose = require("mongoose");
const Category = require("../models/Category");
const { languageCodes } = require("../utils/data");

const SERVICE_DELIVERY_MODES = ["onsite", "online", "hybrid"];
const SERVICE_DURATION_UNITS = ["minutes", "hours", "days"];
const APPROVAL_STATUSES = ["pending", "approved", "rejected"];

const isVendorUser = (user) =>
  user?.role?.toLowerCase && user.role.toLowerCase() === "vendeur";

const resolveOwnerFromRequest = (req) => {
  if (isVendorUser(req.user)) {
    return req.user._id;
  }
  return req.body.owner || req.user?._id || undefined;
};

const applyOwnerConstraint = (query = {}, user, explicitOwner) => {
  if (isVendorUser(user)) {
    return { ...query, owner: user._id };
  }
  if (explicitOwner) {
    return { ...query, owner: explicitOwner };
  }
  return query;
};

const normalizeProductType = (value = "physical") => {
  const normalized = value?.toString().toLowerCase();
  return normalized === "service" ? "service" : "physical";
};

const sanitizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

const sanitizeServiceDetails = (details = {}) => {
  if (!details || typeof details !== "object") {
    return undefined;
  }

  const deliveryMode = SERVICE_DELIVERY_MODES.includes(
    (details.deliveryMode || "").toLowerCase()
  )
    ? details.deliveryMode.toLowerCase()
    : "onsite";

  const durationUnit = SERVICE_DURATION_UNITS.includes(
    (details.durationUnit || "").toLowerCase()
  )
    ? details.durationUnit.toLowerCase()
    : "hours";

  const durationValue = Number(details.durationValue);
  const safeDuration = Number.isFinite(durationValue) && durationValue >= 0
    ? durationValue
    : undefined;

  const normalized = {
    deliveryMode,
    durationUnit,
    durationValue: safeDuration,
    location: sanitizeString(details.location),
    resources: sanitizeString(details.resources),
    notes: sanitizeString(details.notes),
    priceIncludes: sanitizeString(details.priceIncludes),
  };

  // remove empty values except required keys
  return Object.entries(normalized).reduce((acc, [key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(key === "durationValue" && typeof value === "undefined")
    ) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const normalizeApprovalStatus = (status = "pending") => {
  const normalized = status?.toString().toLowerCase();
  if (APPROVAL_STATUSES.includes(normalized)) return normalized;
  return "pending";
};

const buildApprovalSnapshot = ({ status, actor, forcePending = false }) => {
  if (forcePending) {
    return {
      approvalStatus: "pending",
      approvedAt: null,
      approvedBy: null,
    };
  }
  const normalized = normalizeApprovalStatus(status || "approved");
  if (normalized === "approved") {
    return {
      approvalStatus: "approved",
      approvedAt: new Date(),
      approvedBy: actor?._id || null,
    };
  }
  return {
    approvalStatus: normalized,
    approvedAt: null,
    approvedBy: null,
  };
};

const addProduct = async (req, res) => {
  try {
    const type = normalizeProductType(req.body.type);
    const serviceDetails =
      type === "service"
        ? sanitizeServiceDetails(req.body.serviceDetails || {})
        : undefined;

    const payload = {
      ...req.body,
      type,
      serviceDetails,
      // productId: cname + (count + 1),
      productId: req.body.productId
        ? req.body.productId
        : mongoose.Types.ObjectId(),
    };

    const ownerId = resolveOwnerFromRequest(req);
    if (ownerId) {
      payload.owner = ownerId;
    }

    if (type !== "service") {
      delete payload.serviceDetails;
    }

    if (type === "service" && (payload.stock === undefined || payload.stock === null)) {
      payload.stock = 0;
    }

    const approvalSnapshot = buildApprovalSnapshot({
      status: req.body.approvalStatus,
      actor: req.user,
      forcePending: isVendorUser(req.user),
    });
    payload.approvalStatus = approvalSnapshot.approvalStatus;
    payload.approvedAt = approvalSnapshot.approvedAt;
    payload.approvedBy = approvalSnapshot.approvedBy;

    if (approvalSnapshot.approvalStatus !== "approved") {
      payload.status = "hide";
    }

    const newProduct = new Product(payload);

    await newProduct.save();
    res.send(newProduct);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const addAllProducts = async (req, res) => {
  try {
    // console.log('product data',req.body)
    await Product.deleteMany();
    await Product.insertMany(req.body);
    res.status(200).send({
      message: "Product Added successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getShowingProducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: "show",
      approvalStatus: "approved",
    }).sort({ _id: -1 });
    res.send(products);
    // console.log("products", products);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  const { title, category, price, page, limit, type } = req.query;

  let queryObject = {};
  let sortObject = {};
  if (title) {
    const titleQueries = languageCodes.map((lang) => ({
      [`title.${lang}`]: { $regex: `${title}`, $options: "i" },
    }));
    queryObject.$or = titleQueries;
  }

  if (price === "low") {
    sortObject = {
      "prices.originalPrice": 1,
    };
  } else if (price === "high") {
    sortObject = {
      "prices.originalPrice": -1,
    };
  } else if (price === "published") {
    queryObject.status = "show";
  } else if (price === "unPublished") {
    queryObject.status = "hide";
  } else if (price === "status-selling") {
    queryObject.stock = { $gt: 0 };
  } else if (price === "status-out-of-stock") {
    queryObject.stock = { $lt: 1 };
  } else if (price === "date-added-asc") {
    sortObject.createdAt = 1;
  } else if (price === "date-added-desc") {
    sortObject.createdAt = -1;
  } else if (price === "date-updated-asc") {
    sortObject.updatedAt = 1;
  } else if (price === "date-updated-desc") {
    sortObject.updatedAt = -1;
  } else {
    sortObject = { _id: -1 };
  }

  // console.log('sortObject', sortObject);

  if (category) {
    queryObject.categories = category;
  }

  if (type) {
    const normalizedType = normalizeProductType(type);
    queryObject.type = normalizedType;
  }

  queryObject = applyOwnerConstraint(queryObject, req.user, req.query.owner);

  const pages = Number(page);
  const limits = Number(limit);
  const skip = (pages - 1) * limits;

  try {
    const totalDoc = await Product.countDocuments(queryObject);

    const products = await Product.find(queryObject)
      .populate({ path: "category", select: "_id name" })
      .populate({ path: "categories", select: "_id name" })
      .sort(sortObject)
      .skip(skip)
      .limit(limits);

    res.send({
      products,
      totalDoc,
      limits,
      pages,
    });
  } catch (err) {
    // console.log("error", err);
    res.status(500).send({
      message: err.message,
    });
  }
};

const getProductBySlug = async (req, res) => {
  // console.log("slug", req.params.slug);
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      status: "show",
      approvalStatus: "approved",
    });
    if (!product) {
      return res.status(404).send({
        message: "Product not found or not approved.",
      });
    }
    res.send(product);
  } catch (err) {
    res.status(500).send({
      message: `Slug problem, ${err.message}`,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const filter = applyOwnerConstraint(
      { _id: req.params.id },
      req.user
    );

    const product = await Product.findOne(filter)
      .populate({ path: "category", select: "_id, name" })
      .populate({ path: "categories", select: "_id name" });

    if (!product) {
      return res.status(404).send({
        message: "Product not found or access denied!",
      });
    }

    res.send(product);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateProduct = async (req, res) => {
  // console.log('update product')
  // console.log('variant',req.body.variants)
  try {
    const filter = applyOwnerConstraint(
      { _id: req.params.id },
      req.user
    );
    const product = await Product.findOne(filter);
    // console.log("product", product);

    if (product) {
      product.title = { ...product.title, ...req.body.title };
      product.description = {
        ...product.description,
        ...req.body.description,
      };

      product.productId = req.body.productId;
      product.sku = req.body.sku;
      product.barcode = req.body.barcode;
      product.slug = req.body.slug;
      product.categories = req.body.categories;
      product.category = req.body.category;
      product.show = req.body.show;
      product.isCombination = req.body.isCombination;
      product.variants = req.body.variants;
      product.stock = req.body.stock;
      product.prices = req.body.prices;
      product.image = req.body.image;
      product.tag = req.body.tag;
      if (!isVendorUser(req.user) && req.body.owner) {
        product.owner = req.body.owner;
      }

      const nextType = normalizeProductType(req.body.type || product.type);
      const nextServiceDetails =
        nextType === "service"
          ? sanitizeServiceDetails(
              req.body.serviceDetails || product.serviceDetails || {}
            )
          : undefined;

      product.type = nextType;
      product.serviceDetails =
        nextType === "service" ? nextServiceDetails : undefined;

      if (isVendorUser(req.user)) {
        const snapshot = buildApprovalSnapshot({ forcePending: true });
        product.approvalStatus = snapshot.approvalStatus;
        product.approvedAt = snapshot.approvedAt;
        product.approvedBy = snapshot.approvedBy;
        product.status = "hide";
      } else if (req.body.approvalStatus) {
        const snapshot = buildApprovalSnapshot({
          status: req.body.approvalStatus,
          actor: req.user,
        });
        product.approvalStatus = snapshot.approvalStatus;
        product.approvedAt = snapshot.approvedAt;
        product.approvedBy = snapshot.approvedBy;
        if (snapshot.approvalStatus !== "approved" && product.status === "show") {
          product.status = "hide";
        }
      }

      await product.save();
      res.send({ data: product, message: "Product updated successfully!" });
    } else {
      res.status(404).send({
        message: "Product not found or access denied!",
      });
    }
  } catch (err) {
    res.status(404).send(err.message);
    // console.log('err',err)
  }
};

const updateManyProducts = async (req, res) => {
  try {
    const updatedData = {};
    for (const key of Object.keys(req.body)) {
      if (
        req.body[key] !== "[]" &&
        Object.entries(req.body[key]).length > 0 &&
        req.body[key] !== req.body.ids
      ) {
        // console.log('req.body[key]', typeof req.body[key]);
        updatedData[key] = req.body[key];
      }
    }

    // console.log("updated data", updatedData);

    if (updatedData.type) {
      const normalizedType = normalizeProductType(updatedData.type);
      updatedData.type = normalizedType;
      if (normalizedType === "service") {
        updatedData.serviceDetails =
          sanitizeServiceDetails(req.body.serviceDetails || {}) || null;
      } else {
        updatedData.serviceDetails = null;
      }
    } else if (req.body.serviceDetails) {
      updatedData.serviceDetails =
        sanitizeServiceDetails(req.body.serviceDetails) || null;
    }

    if (isVendorUser(req.user)) {
      const snapshot = buildApprovalSnapshot({ forcePending: true });
      updatedData.approvalStatus = snapshot.approvalStatus;
      updatedData.approvedAt = snapshot.approvedAt;
      updatedData.approvedBy = snapshot.approvedBy;
      updatedData.status = "hide";
    } else if (updatedData.approvalStatus) {
      const snapshot = buildApprovalSnapshot({
        status: updatedData.approvalStatus,
        actor: req.user,
      });
      updatedData.approvalStatus = snapshot.approvalStatus;
      updatedData.approvedAt = snapshot.approvedAt;
      updatedData.approvedBy = snapshot.approvedBy;
      if (snapshot.approvalStatus !== "approved") {
        updatedData.status = "hide";
      }
    }

    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    if (!ids.length) {
      return res.status(400).send({
        message: "Product ids are required for bulk update.",
      });
    }

    const filter = applyOwnerConstraint(
      { _id: { $in: ids } },
      req.user
    );

    const result = await Product.updateMany(
      filter,
      {
        $set: updatedData,
      },
      {
        multi: true,
      }
    );

    if (!result.matchedCount && !result.modifiedCount) {
      return res.status(404).send({
        message: "No products updated. Check access rights.",
      });
    }

    res.send({
      message: "Products update successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const newStatus = req.body.status;
    const filter = applyOwnerConstraint(
      { _id: req.params.id },
      req.user
    );

    const result = await Product.updateOne(filter, {
      $set: { status: newStatus },
    });

    if (!result.matchedCount) {
      return res.status(404).send({
        message: "Product not found or access denied!",
      });
    }

    res.status(200).send({
      message: `Product ${newStatus} Successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateApprovalStatus = async (req, res) => {
  if (isVendorUser(req.user)) {
    return res.status(403).send({
      message: "Vendors cannot approve products.",
    });
  }

  try {
    const snapshot = buildApprovalSnapshot({
      status: req.body.status,
      actor: req.user,
    });

    const updatePayload = {
      approvalStatus: snapshot.approvalStatus,
      approvedAt: snapshot.approvedAt,
      approvedBy: snapshot.approvedBy,
    };

    if (snapshot.approvalStatus !== "approved") {
      updatePayload.status = "hide";
    }

    const result = await Product.updateOne(
      { _id: req.params.id },
      {
        $set: updatePayload,
      }
    );

    if (!result.matchedCount) {
      return res.status(404).send({
        message: "Product not found.",
      });
    }

    res.status(200).send({
      message:
        snapshot.approvalStatus === "approved"
          ? "Product approved successfully!"
          : "Product approval updated.",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const filter = applyOwnerConstraint(
      { _id: req.params.id },
      req.user
    );

    const result = await Product.deleteOne(filter);

    if (!result.deletedCount) {
      return res.status(404).send({
        message: "Product not found or access denied!",
      });
    }

    res.status(200).send({
      message: "Product Deleted Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getShowingStoreProducts = async (req, res) => {
  // console.log("req.body", req);
  try {
    const baseFilter = { status: "show", approvalStatus: "approved" };
    const queryObject = { ...baseFilter };

    const { category, title, slug } = req.query;
    // console.log("title", title);

    // console.log("query", req);

    if (category) {
      queryObject.categories = {
        $in: [category],
      };
    }

    if (title) {
      const titleQueries = languageCodes.map((lang) => ({
        [`title.${lang}`]: { $regex: `${title}`, $options: "i" },
      }));

      queryObject.$or = titleQueries;
    }
    if (slug) {
      queryObject.slug = { $regex: slug, $options: "i" };
    }

    let products = [];
    let popularProducts = [];
    let discountedProducts = [];
    let relatedProducts = [];

    if (slug) {
      products = await Product.find(queryObject)
        .populate({ path: "category", select: "name _id" })
        .sort({ _id: -1 })
        .limit(100);
      if (products.length) {
        relatedProducts = await Product.find({
          ...baseFilter,
          category: products[0]?.category,
        }).populate({ path: "category", select: "_id name" });
      }
    } else if (title || category) {
      products = await Product.find(queryObject)
        .populate({ path: "category", select: "name _id" })
        .sort({ _id: -1 })
        .limit(100);
    } else {
      popularProducts = await Product.find(baseFilter)
        .populate({ path: "category", select: "name _id" })
        .sort({ sales: -1 })
        .limit(20);

      discountedProducts = await Product.find({
        ...baseFilter,
        $or: [
          {
            $and: [
              { isCombination: true },
              {
                variants: {
                  $elemMatch: {
                    discount: { $gt: "0.00" },
                  },
                },
              },
            ],
          },
          {
            $and: [
              { isCombination: false },
              {
                $expr: {
                  $gt: [
                    { $toDouble: "$prices.discount" }, // Convert the discount field to a double
                    0,
                  ],
                },
              },
            ],
          },
        ],
      })
        .populate({ path: "category", select: "name _id" })
        .sort({ _id: -1 })
        .limit(20);
    }

    res.send({
      products,
      popularProducts,
      relatedProducts,
      discountedProducts,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const deleteManyProducts = async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    if (!ids.length) {
      return res.status(400).send({
        message: "Product ids are required for deletion.",
      });
    }

    const filter = applyOwnerConstraint(
      { _id: { $in: ids } },
      req.user
    );

    const result = await Product.deleteMany(filter);

    if (!result.deletedCount) {
      return res.status(404).send({
        message: "No products deleted. Check access rights.",
      });
    }

    res.send({
      message: `Products Delete Successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

module.exports = {
  addProduct,
  addAllProducts,
  getAllProducts,
  getShowingProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  updateManyProducts,
  updateStatus,
  updateApprovalStatus,
  deleteProduct,
  deleteManyProducts,
  getShowingStoreProducts,
};
