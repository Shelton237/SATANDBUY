"use strict";

const { authSeeds, catalogSeeds, orderSeeds, settingsSeeds } = require("./data");
const { withServiceDatabase } = require("./utils");

const seedAuth = async () => {
  const Admin = require("../../services/auth-service/src/models/Admin");
  const Customer = require("../../services/auth-service/src/models/Customer");

  await withServiceDatabase("auth", async () => {
    await Promise.all([Admin.deleteMany({}), Customer.deleteMany({})]);
    await Admin.insertMany(authSeeds.admins);
    await Customer.insertMany(authSeeds.customers);
    console.log(
      `  → Inserté ${authSeeds.admins.length} staffs et ${authSeeds.customers.length} clients`
    );
  });
};

const seedCatalog = async () => {
  const Language = require("../../packages/catalog-domain/src/models/Language");
  const Currency = require("../../packages/catalog-domain/src/models/Currency");
  const Attribute = require("../../packages/catalog-domain/src/models/Attribute");
  const Category = require("../../packages/catalog-domain/src/models/Category");
  const Product = require("../../packages/catalog-domain/src/models/Product");
  const Coupon = require("../../packages/catalog-domain/src/models/Coupon");

  await withServiceDatabase("catalog", async () => {
    await Promise.all([
      Language.deleteMany({}),
      Currency.deleteMany({}),
      Attribute.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
    ]);

    await Language.insertMany(catalogSeeds.languages);
    await Currency.insertMany(catalogSeeds.currencies);
    await Attribute.insertMany(catalogSeeds.attributes);
    await Category.insertMany(catalogSeeds.categories);
    await Product.insertMany(catalogSeeds.products);
    await Coupon.insertMany(catalogSeeds.coupons);
    console.log(
      `  → Catalogues insérés (${catalogSeeds.categories.length} catégories, ${catalogSeeds.products.length} produits)`
    );
  });
};

const seedOrder = async () => {
  const ShippingRate = require("../../packages/order-domain/src/models/ShippingRate");
  const Order = require("../../packages/order-domain/src/models/Order");

  await withServiceDatabase("order", async () => {
    await Promise.all([ShippingRate.deleteMany({}), Order.deleteMany({})]);
    await ShippingRate.insertMany(orderSeeds.shippingRates);
    await Order.insertMany(orderSeeds.orders);
    console.log(
      `  → Créé ${orderSeeds.orders.length} commandes et ${orderSeeds.shippingRates.length} grilles de livraison`
    );
  });
};

const seedSettings = async () => {
  const Setting = require("../../packages/settings-domain/src/models/Setting");

  await withServiceDatabase("settings", async () => {
    await Setting.deleteMany({});
    await Setting.insertMany(settingsSeeds);
    console.log(`  → Paramètres insérés (${settingsSeeds.length} blocs)`);
  });
};

const run = async () => {
  console.log("Seeding Sat & Buy datasets...");
  console.log("1) Auth service");
  await seedAuth();
  console.log("2) Catalog service");
  await seedCatalog();
  console.log("3) Order service");
  await seedOrder();
  console.log("4) Settings service");
  await seedSettings();
  console.log("✔ Données injectées avec succès.");
};

run().catch((err) => {
  console.error("Échec du seed:", err);
  process.exitCode = 1;
});
