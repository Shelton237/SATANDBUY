"use strict";

const { catalogSeeds } = require("./data");
const { withServiceDatabase } = require("./utils");

const seedCatalogOnly = async () => {
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
      `Catalogue rafraîchi: ${catalogSeeds.categories.length} catégories, ${catalogSeeds.products.length} produits, ${catalogSeeds.coupons.length} coupons.`
    );
  });
};

seedCatalogOnly().catch((err) => {
  console.error("Seed catalogue échoué:", err);
  process.exitCode = 1;
});
