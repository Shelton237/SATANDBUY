/* eslint-disable no-console */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDB } = require("../config/db");
const Admin = require("../models/Admin");
const Category = require("../models/Category");
const Product = require("../models/Product");

const VENDOR_EMAIL = process.env.SEED_VENDOR_EMAIL || "vendor@satandbuy.com";
const VENDOR_PASSWORD =
  process.env.SEED_VENDOR_PASSWORD || "Vendor#2024";

const vendorProfile = {
  name: {
    en: "Marchand Fraicheur",
    fr: "Marchand Fraicheur",
  },
  image:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  address: "Marche de Bonapriso, Douala",
  country: "CM",
  city: "Douala",
  phone: "+237650000001",
  role: "Vendeur",
  status: "Active",
};

const categoryBlueprints = [
  {
    slug: "fresh-vegetables",
    name: {
      en: "Fresh Vegetables",
      fr: "Legumes frais",
    },
    description: {
      en: "Picked at dawn from trusted farms for the crunchy salads highlighted sur la boutique.",
      fr: "Recoltes a l'aube aupres de fermes partenaires pour les salades croquantes mises en avant sur le store.",
    },
    icon:
      "https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=200&q=60",
  },
  {
    slug: "fruits-and-juice",
    name: {
      en: "Fruits & Juice",
      fr: "Fruits & jus",
    },
    description: {
      en: "Vitamin boosters inspired by the Fresh & Natural hero banner.",
      fr: "Boosters vitamines inspires de la section  Fresh & Natural  du store.",
    },
    icon:
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=200&q=60",
  },
  {
    slug: "fish-and-meat",
    name: {
      en: "Fish & Meat",
      fr: "Poisson & Viande",
    },
    description: {
      en: "Premium proteins highlighted dans le carrousel Fish & Meat.",
      fr: "Les meilleures proteines mises en avant dans le carrousel  Fish & Meat .",
    },
    icon:
      "https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=200&q=60",
  },
  {
    slug: "bread-and-bakery",
    name: {
      en: "Bread & Bakery",
      fr: "Boulangerie",
    },
    description: {
      en: "Artisan loaves et viennoiseries rappelant la section Bread & Bakery.",
      fr: "Pains artisanaux et viennoiseries inspires de  Bread & Bakery .",
    },
    icon:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=60",
  },
  {
    slug: "breakfast-pantry",
    name: {
      en: "Breakfast & Pantry",
      fr: "Petit-dejeuner & epicerie",
    },
    description: {
      en: "Granola, tartinables et indispensables pour remplir rapidement la boutique dun vendeur.",
      fr: "Granolas, tartinables et essentiels pour garnir rapidement la boutique dun vendeur.",
    },
    icon:
      "https://images.unsplash.com/photo-1475856034135-5a1e2b6109f4?auto=format&fit=crop&w=200&q=60",
  },
  {
    slug: "beauty-and-wellness",
    name: {
      en: "Beauty & Wellness",
      fr: "Beaute & bien-etre",
    },
    description: {
      en: "Produits cocooning pour refleter loffre lifestyle mise en avant sur le store.",
      fr: "Produits cocooning pour refleter loffre lifestyle mise en avant sur le store.",
    },
    icon:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=200&q=60",
  },
];

const productBlueprints = [
  {
    slug: "organic-baby-spinach-250g",
    categorySlug: "fresh-vegetables",
    title: {
      en: "Organic Baby Spinach (250g)",
      fr: "Jeunes pousses d'epinard bio (250 g)",
    },
    description: {
      en: "Tender leaves washed and ready for the salads and smoothies promoted on the home hero.",
      fr: "Feuilles tendres pretes a lemploi pour les salades et smoothies mis en avant sur la home.",
    },
    price: 1800,
    originalPrice: 2100,
    stock: 160,
    tags: ["vegetable", "organic", "greens"],
    images: [
      "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "rainbow-carrot-bundle",
    categorySlug: "fresh-vegetables",
    title: {
      en: "Rainbow Carrot Bundle",
      fr: "Bouquet de carottes multicolores",
    },
    description: {
      en: "Crunchy carrots harvested at dawn. Looks exactly like the CTA Fresh & Natural.",
      fr: "Carottes croquantes recoltees a laube  lesprit de la vignette  Fresh & Natural .",
    },
    price: 1500,
    originalPrice: 1700,
    stock: 110,
    tags: ["vegetable", "carrot", "bundle"],
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "sunny-citrus-juice-pack",
    categorySlug: "fruits-and-juice",
    title: {
      en: "Sunny Citrus Juice Pack",
      fr: "Pack jus agrumes ensoleille",
    },
    description: {
      en: "Cold-pressed orange & grapefruit mix, perfect for the breakfast block.",
      fr: "Melange presse doranges et de pamplemousses, parfait pour la mise en avant petit-dejeuner.",
    },
    price: 3200,
    originalPrice: 3500,
    stock: 90,
    tags: ["juice", "citrus", "drink"],
    images: [
      "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "tropical-comfort-fruit-box",
    categorySlug: "fruits-and-juice",
    title: {
      en: "Tropical Comfort Fruit Box",
      fr: "Box fruits tropicaux confort",
    },
    description: {
      en: "Hand-picked mangoes, passion fruits and pineapple directly inspired by the store tiles.",
      fr: "Mangues, fruits de la passion et ananas selectionnes, dans lesprit des tuiles produits du store.",
    },
    price: 7800,
    originalPrice: 8200,
    stock: 65,
    tags: ["fruit", "box", "tropical"],
    images: [
      "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "atlantic-salmon-steaks",
    categorySlug: "fish-and-meat",
    title: {
      en: "Atlantic Salmon Steaks (2x180g)",
      fr: "Paves de saumon Atlantique (2x180 g)",
    },
    description: {
      en: "Buttery salmon cuts highlighted in the Fish & Meat slider.",
      fr: "Paves fondants mis en scene dans le carrousel  Fish & Meat .",
    },
    price: 9800,
    originalPrice: 10200,
    stock: 80,
    tags: ["salmon", "fish", "protein"],
    images: [
      "https://images.unsplash.com/photo-1478749485505-2a903a729c63?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "herb-marinated-chicken-breast",
    categorySlug: "fish-and-meat",
    title: {
      en: "Herb Marinated Chicken Breast",
      fr: "Filet de poulet marine aux herbes",
    },
    description: {
      en: "Ready-to-cook protein tray for the quick Confirm Order flow.",
      fr: "Barquette prete a cuire pour dynamiser le parcours  Confirm Order .",
    },
    price: 7200,
    originalPrice: 7600,
    stock: 120,
    tags: ["chicken", "ready-to-cook"],
    images: [
      "https://images.unsplash.com/photo-1612874472338-0f9536b05554?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "stone-baked-sourdough-loaf",
    categorySlug: "bread-and-bakery",
    title: {
      en: "Stone Baked Sourdough Loaf",
      fr: "Pain au levain cuit pierre",
    },
    description: {
      en: "Golden crust loaf, same vibe as the Bread & Bakery CTA.",
      fr: "Pain a croute doree dans la lignee du visuel  Bread & Bakery .",
    },
    price: 3100,
    originalPrice: 3400,
    stock: 75,
    tags: ["bread", "bakery", "artisan"],
    images: [
      "https://images.unsplash.com/photo-1475856034135-5a1e2b6109f4?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "buttery-morning-croissants",
    categorySlug: "bread-and-bakery",
    title: {
      en: "Buttery Morning Croissants (pack of 4)",
      fr: "Croissants pur beurre du matin (x4)",
    },
    description: {
      en: "Flaky viennoiseries baked locally to mirror the store promo cards.",
      fr: "Viennoiseries feuilletees style promo cards de la boutique.",
    },
    price: 4200,
    originalPrice: 4500,
    stock: 95,
    tags: ["croissant", "viennoiserie"],
    images: [
      "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "crunchy-breakfast-granola",
    categorySlug: "breakfast-pantry",
    title: {
      en: "Crunchy Breakfast Granola",
      fr: "Granola croustillant petit-dej",
    },
    description: {
      en: "Toasted oats with cocoa nibs matching the breakfast spotlight.",
      fr: "Flocons toastes et eclats de cacao, parfaits pour la mise en avant petit-dejeuner.",
    },
    price: 5600,
    originalPrice: 6000,
    stock: 130,
    tags: ["granola", "breakfast", "pantry"],
    images: [
      "https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "artisan-ground-peanut-butter",
    categorySlug: "breakfast-pantry",
    title: {
      en: "Artisan Ground Peanut Butter",
      fr: "Beurre de cacahuete artisanal",
    },
    description: {
      en: "Slow roasted peanuts for the pantry block.",
      fr: "Cacahuetes torrefiees lentement pour alimenter le bloc epicerie.",
    },
    price: 4900,
    originalPrice: 5200,
    stock: 85,
    tags: ["spread", "pantry"],
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "shea-butter-body-cream",
    categorySlug: "beauty-and-wellness",
    title: {
      en: "Shea Butter Body Cream",
      fr: "Creme corporelle au beurre de karite",
    },
    description: {
      en: "Velvety texture echoing the lifestyle tiles of the store.",
      fr: "Texture onctueuse qui reflete les tuiles lifestyle du store.",
    },
    price: 6500,
    originalPrice: 6900,
    stock: 140,
    tags: ["beauty", "body", "wellness"],
    images: [
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "hibiscus-comfort-tea",
    categorySlug: "beauty-and-wellness",
    title: {
      en: "Hibiscus Comfort Tea Blend",
      fr: "Infusion reconfort hibiscus",
    },
    description: {
      en: "Relaxing blend sold next to the beauty picks on the store.",
      fr: "Melange relaxant a positionner pres de la selection beaute.",
    },
    price: 3700,
    originalPrice: 3900,
    stock: 105,
    tags: ["tea", "relax", "wellness"],
    images: [
      "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

const ensureVendor = async () => {
  const email = VENDOR_EMAIL.toLowerCase();
  const existing = await Admin.findOne({ email });

  if (existing) {
    existing.role = "Vendeur";
    existing.status = "Active";
    existing.phone = vendorProfile.phone;
    await existing.save();
    console.log("[INFO] Vendeur existant synchronise.");
    return existing;
  }

  const hashed = bcrypt.hashSync(VENDOR_PASSWORD, 10);
  const payload = {
    ...vendorProfile,
    password: hashed,
    email,
  };

  const vendor = await Admin.create(payload);
  console.log("[OK] Nouveau vendeur cree.");
  return vendor;
};

const ensureCategories = async () => {
  const entries = {};
  for (const blueprint of categoryBlueprints) {
    const category = await Category.findOneAndUpdate(
      { slug: blueprint.slug },
      {
        $set: {
          name: blueprint.name,
          description: blueprint.description,
          slug: blueprint.slug,
          icon: blueprint.icon,
          status: "show",
        },
      },
      { upsert: true, new: true }
    );

    entries[blueprint.slug] = category;
  }
  console.log(
    `[INFO] ${Object.keys(entries).length} categories synchronisees pour le vendeur.`
  );
  return entries;
};

const upsertProduct = async (blueprint, vendor, categories) => {
  const categoryDoc = categories[blueprint.categorySlug];
  if (!categoryDoc?._id) {
    throw new Error(
      `Category with slug ${blueprint.categorySlug} is missing.`
    );
  }

  const discount =
    typeof blueprint.discount === "number"
      ? blueprint.discount
      : Math.max(0, blueprint.originalPrice - blueprint.price);

  const payload = {
    title: blueprint.title,
    description: blueprint.description,
    slug: blueprint.slug,
    categories: [categoryDoc._id],
    category: categoryDoc._id,
    owner: vendor._id,
    image: blueprint.images,
    stock: blueprint.stock,
    sales: 0,
    tag: blueprint.tags,
    prices: {
      originalPrice: blueprint.originalPrice,
      price: blueprint.price,
      discount,
    },
    variants: [],
    isCombination: false,
    type: "physical",
    status: "show",
    approvalStatus: "approved",
    approvedAt: new Date(),
    approvedBy: vendor._id,
  };

  const product = await Product.findOneAndUpdate(
    { slug: blueprint.slug },
    payload,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return product;
};

const run = async () => {
  await connectDB();

  const vendor = await ensureVendor();
  const categories = await ensureCategories();

  const inserted = [];
  for (const blueprint of productBlueprints) {
    const product = await upsertProduct(blueprint, vendor, categories);
    inserted.push(product.slug);
  }

  console.log(
    `[INFO] ${inserted.length} produits synchronises pour ${vendor.email}:`
  );
  inserted.forEach((slug) => console.log(`   - ${slug}`));

  console.log(
    "[DONE] Le vendeur dispose maintenant d'un catalogue complet inspire du store."
  );
  process.exit(0);
};

run().catch((err) => {
  console.error("[ERROR] Echec de l'amorcage du catalogue vendeur :", err);
  process.exit(1);
});
