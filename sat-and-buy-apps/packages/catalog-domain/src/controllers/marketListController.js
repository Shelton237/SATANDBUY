const MarketList = require("../models/MarketList");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

const ALLOWED_STATUSES = ["pending", "validated", "cancelled"];

const createMarketList = async (req, res) => {
  try {
    const { name, note, items = [] } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).send({
        message: "La liste doit contenir au moins un article.",
      });
    }

    const productIds = items
      .map((item) => item?.productId)
      .filter(Boolean)
      .map((id) => id.toString());

    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const sanitizedItems = [];
    let totalValue = 0;

    for (const entry of items) {
      const quantity = Number(entry?.quantity) || 0;
      if (quantity < 1) {
        return res.status(400).send({
          message: "Chaque article nécessite une quantité minimale de 1.",
        });
      }

      const product = productMap.get(entry.productId?.toString?.());
      if (!product) {
        return res.status(400).send({
          message: `Produit introuvable pour l'ID ${entry.productId}.`,
        });
      }

      const desiredPrice =
        Number(entry?.desiredPrice) >= 0
          ? Number(entry.desiredPrice)
          : Number(product?.prices?.price) || 0;

      const itemTotal = desiredPrice * quantity;
      totalValue += itemTotal;

      sanitizedItems.push({
        product: product._id,
        productTitle: product.title?.fr || product.title?.en || product.title || "",
        productSlug: product.slug || "",
        productImage: Array.isArray(product.image) ? product.image[0] : product.image,
        quantity,
        desiredPrice,
      });
    }

    const marketList = new MarketList({
      customer: req.user._id,
      name: name || "Liste de marché",
      note: note || "",
      items: sanitizedItems,
      totalValue,
    });
    await marketList.save();

    res.status(201).send(marketList);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getMarketLists = async (req, res) => {
  try {
    const lists = await MarketList.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.send(lists);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getAdminMarketLists = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, customerName = "" } = req.query;
    const numericPage = Math.max(Number(page) || 1, 1);
    const numericLimit = Math.max(Number(limit) || 20, 1);

    const filter = {};
    if (status && ALLOWED_STATUSES.includes(status)) {
      filter.status = status;
    }

    if (customerName.trim()) {
      const matchingCustomers = await Customer.find({
        name: { $regex: customerName, $options: "i" },
      }).select("_id");

      if (!matchingCustomers.length) {
        return res.send({ lists: [], totalDoc: 0, page: numericPage, limit: numericLimit });
      }

      filter.customer = { $in: matchingCustomers.map((customer) => customer._id) };
    }

    const [totalDoc, lists] = await Promise.all([
      MarketList.countDocuments(filter),
      MarketList.find(filter)
        .sort({ createdAt: -1 })
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit)
        .populate("customer", "name email phone")
        .lean(),
    ]);

    res.send({
      lists,
      totalDoc,
      page: numericPage,
      limit: numericLimit,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const updateMarketListStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).send({
        message: "Statut invalide.",
      });
    }

    const marketList = await MarketList.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("customer", "name email phone")
      .lean();

    if (!marketList) {
      return res.status(404).send({
        message: "Liste introuvable.",
      });
    }

    res.send({
      message: "Statut mis à jour.",
      marketList,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const updateMarketList = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, note, items = [] } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).send({
        message: "La liste doit contenir au moins un article.",
      });
    }

    const marketList = await MarketList.findById(id);
    if (!marketList) {
      return res.status(404).send({
        message: "Liste introuvable.",
      });
    }

    if (marketList.customer.toString() !== req.user._id) {
      return res.status(403).send({
        message: "Impossible de modifier cette liste.",
      });
    }

    if (marketList.status !== "pending") {
      return res.status(400).send({
        message: "Cette liste ne peut plus être modifiée.",
      });
    }

    const productIds = items
      .map((item) => item?.productId)
      .filter(Boolean)
      .map((id) => id.toString());

    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const sanitizedItems = [];
    let totalValue = 0;

    for (const entry of items) {
      const quantity = Number(entry?.quantity) || 0;
      if (quantity < 1) {
        return res.status(400).send({
          message: "Chaque article nécessite une quantité minimale de 1.",
        });
      }

      const product = productMap.get(entry.productId?.toString?.());
      if (!product) {
        return res.status(400).send({
          message: `Produit introuvable pour l'ID ${entry.productId}.`,
        });
      }

      const desiredPrice =
        Number(entry?.desiredPrice) >= 0
          ? Number(entry.desiredPrice)
          : Number(product?.prices?.price) || 0;

      const itemTotal = desiredPrice * quantity;
      totalValue += itemTotal;

      sanitizedItems.push({
        product: product._id,
        productTitle: product.title?.fr || product.title?.en || product.title || "",
        productSlug: product.slug || "",
        productImage: Array.isArray(product.image) ? product.image[0] : product.image,
        quantity,
        desiredPrice,
      });
    }

    marketList.name = name || marketList.name;
    marketList.note = note || marketList.note;
    marketList.items = sanitizedItems;
    marketList.totalValue = totalValue;

    await marketList.save();
    res.send(marketList);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = {
  createMarketList,
  getMarketLists,
  getAdminMarketLists,
  updateMarketListStatus,
  updateMarketList,
};
