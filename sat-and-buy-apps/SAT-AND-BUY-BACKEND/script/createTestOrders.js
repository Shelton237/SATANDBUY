/* eslint-disable no-console */
require("dotenv").config();
const dayjs = require("dayjs");
const { connectDB } = require("../config/db");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Admin = require("../models/Admin");

const formatPrice = (value) =>
  typeof value === "number" ? Number(value.toFixed(2)) : 0;

const buildCartItems = (products = []) =>
  products.map((product, index) => {
    const basePrice =
      product?.prices?.price || product?.prices?.originalPrice || 0;
    const quantity = 1 + index;
    return {
      productId: product?._id?.toString(),
      title: product?.title || {},
      slug: product?.slug,
      image: product?.image?.[0] || "",
      quantity,
      prices: {
        price: formatPrice(basePrice),
        originalPrice: formatPrice(product?.prices?.originalPrice || basePrice),
        discount: formatPrice(product?.prices?.discount || 0),
      },
      categories: (product?.categories || []).map((id) => id?.toString()),
      tag: product?.tag || [],
      variants: product?.variants || [],
      sku: product?.sku || "",
      barcode: product?.barcode || "",
    };
  });

const computeTotals = (items, shipping = 2000, discount = 0) => {
  const subTotal = items.reduce(
    (sum, item) => sum + item.prices.price * item.quantity,
    0
  );
  const total = subTotal + shipping - discount;
  return {
    subTotal: formatPrice(subTotal),
    shippingCost: formatPrice(shipping),
    discount: formatPrice(discount),
    total: formatPrice(total),
  };
};

const main = async () => {
  await connectDB();

  const existing = await Order.findOne({
    "user_info.reference": "WF-DEMO-01",
  });
  if (existing) {
    console.log("✅ Des commandes de démonstration existent déjà.");
    process.exit(0);
  }

  let customer = await Customer.findOne();
  if (!customer) {
    customer = await Customer.create({
      name: "Client Démo",
      email: `demo+${Date.now()}@example.com`,
      address: "Quartier Bonapriso, Douala",
      country: "CM",
      city: "Douala",
      phone: "+237620000000",
    });
    console.log("ℹ️ Aucun client trouvé : un client démo a été créé.");
  }

  const products = await Product.find().limit(3);
  if (!products.length) {
    console.error("❌ Aucun produit disponible pour générer les commandes.");
    process.exit(1);
  }

  const sorter =
    (await Admin.findOne({ role: "Trieur" })) || (await Admin.findOne());

  const contact = {
    name: customer.name,
    email: customer.email,
    contact: customer.phone || "+237000000",
    address: customer.address || "Adresse non renseignée",
    city: customer.city || "",
    country: customer.country || "",
  };

  const [productA, productB, productC] = products;
  const now = dayjs();

  const ordersToInsert = [];

  // Pending order
  const pendingItems = buildCartItems([productA]);
  ordersToInsert.push({
    user: customer._id,
    cart: pendingItems,
    ...computeTotals(pendingItems, 1500),
    paymentMethod: "Cash",
    user_info: {
      ...contact,
      reference: "WF-DEMO-01",
    },
    status: "Pending",
  });

  // Sorting in progress
  const sortingItems = buildCartItems([productB]);
  ordersToInsert.push({
    user: customer._id,
    cart: sortingItems,
    ...computeTotals(sortingItems, 2000),
    paymentMethod: "MobileMoney",
    user_info: {
      ...contact,
      reference: "WF-DEMO-02",
    },
    status: "Sorting",
    sorting: {
      assignedTo: sorter?._id || null,
      status: "InProgress",
      startedAt: now.subtract(1, "hour").toDate(),
      notes: "Collecte des articles et contrôle qualité en cours.",
    },
  });

  // Ready for delivery
  const readyItems = buildCartItems([productC]);
  ordersToInsert.push({
    user: customer._id,
    cart: readyItems,
    ...computeTotals(readyItems, 2500),
    paymentMethod: "Card",
    user_info: {
      ...contact,
      reference: "WF-DEMO-03",
    },
    status: "ReadyForDelivery",
    sorting: {
      assignedTo: sorter?._id || null,
      status: "Completed",
      startedAt: now.subtract(2, "hour").toDate(),
      completedAt: now.subtract(1, "hour").toDate(),
      notes: "Tri terminé, colis prêt pour la livraison.",
    },
    deliveryPlan: {
      status: "Scheduled",
      assignedDriver: "Livreur démo",
      deliveryDate: now.add(1, "day").toDate(),
      deliveryWindow: "10h-12h",
      notes: "Appeler le client 30 minutes avant l'arrivée.",
    },
  });

  await Order.insertMany(ordersToInsert);
  console.log(`✅ ${ordersToInsert.length} commandes de test ont été créées.`);
  process.exit(0);
};

main().catch((err) => {
  console.error("❌ Erreur lors de la création des commandes de test:", err);
  process.exit(1);
});
