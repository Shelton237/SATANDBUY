require("dotenv").config({ path: "../.env" });
const { connectDB } = require("../config/db");
const Category = require("../models/Category");
const Attribute = require("../models/Attribute");
const Product = require("../models/Product");

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const ensureCategory = async () => {
  const nameFr = "Électronique & Énergie";
  const slug = slugify(nameFr);
  let category = await Category.findOne({ slug });
  if (category) return category;
  category = await Category.create({
    name: { fr: nameFr, en: "Electronics & Energy" },
    description: {
      fr: "Solutions solaires et accessoires pensés pour le marché CFA.",
      en: "Solar kits and accessories tailored for the CFA market.",
    },
    slug,
    icon:
      "https://res.cloudinary.com/demo/image/upload/v1728000000/solar-kit.png",
    status: "show",
  });
  return category;
};

const ensureAttribute = async () => {
  const slug = slugify("Marque régionale");
  let attribute = await Attribute.findOne({ slug });
  if (attribute) return attribute;
  attribute = await Attribute.create({
    title: { fr: "Marque régionale", en: "Regional Brand" },
    name: { fr: "Marque", en: "Brand" },
    option: "Dropdown",
    type: "attribute",
    status: "show",
    slug,
    variants: [
      {
        name: { fr: "SunuTech", en: "SunuTech" },
        status: "show",
      },
      {
        name: { fr: "Ndoukou Power", en: "Ndoukou Power" },
        status: "show",
      },
      {
        name: { fr: "Aïda Solar", en: "Aida Solar" },
        status: "show",
      },
    ],
  });
  return attribute;
};

const ensureProduct = async (category) => {
  const slug = slugify("kit solaire autonomie fcfa");
  let product = await Product.findOne({ slug });
  if (product) return product;
  product = await Product.create({
    productId: "FCFA-PRO-001",
    sku: "KIT-FCFA-001",
    barcode: "",
    title: {
      fr: "Kit solaire autonomie (FCFA)",
      en: "Autonomy solar kit (FCFA)",
    },
    description: {
      fr: "Pack complet 2 panneaux + batterie + onduleur adapté aux foyers ou boutiques.",
      en: "Complete home kit with 2 panels, battery and inverter for shops or homes.",
    },
    slug,
    categories: [category._id],
    category: category._id,
    image: [
      "https://res.cloudinary.com/demo/image/upload/v1728000000/solar-kit-front.png",
      "https://res.cloudinary.com/demo/image/upload/v1728000000/solar-kit-packaging.png",
    ],
    stock: 120,
    sales: 0,
    tag: ["solaire", "fcfa", "kit"],
    prices: {
      originalPrice: 175000,
      price: 155000,
      discount: 20000,
    },
    variants: [],
    isCombination: false,
    status: "show",
  });
  return product;
};

(async () => {
  try {
    await connectDB();
    const category = await ensureCategory();
    const attribute = await ensureAttribute();
    const product = await ensureProduct(category);

    console.log("Category:", category._id.toString());
    console.log("Attribute:", attribute._id.toString());
    console.log("Product:", product._id.toString());
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
