"use strict";

const Attribute = require("./models/Attribute");
const Category = require("./models/Category");
const Coupon = require("./models/Coupon");
const Currency = require("./models/Currency");
const Language = require("./models/Language");
const MarketList = require("./models/MarketList");
const Product = require("./models/Product");

module.exports = {
  models: {
    Product,
    Category,
    Attribute,
    Coupon,
    Currency,
    Language,
    MarketList,
  },
  controllers: {
    product: require("./controllers/productController"),
    category: require("./controllers/categoryController"),
    attribute: require("./controllers/attributeController"),
    coupon: require("./controllers/couponController"),
    currency: require("./controllers/currencyController"),
    language: require("./controllers/languageController"),
    marketList: require("./controllers/marketListController"),
  },
  lib: {
    productInventory: require("./lib/productInventory"),
  },
};
