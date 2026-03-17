"use strict";

const sharedMongo = require("../../packages/shared/src/mongo/connection");
const { DEFAULT_DRIVER_SLOTS } = require("../../packages/shared/src/constants/delivery");
const bcrypt = require("../../services/auth-service/node_modules/bcryptjs");

const { Types } = sharedMongo.mongoose;
const objectId = (value) =>
  value ? new Types.ObjectId(value) : new Types.ObjectId();

const ids = {
  admins: {
    super: objectId("69963d8e1e89db1d638de666"),
    operations: objectId("699cd9aafce6ccc438137e62"),
    driver: objectId("699cd9aafce6ccc438137e90"),
  },
  customers: {
    patricia: objectId("699cd9aafce6ccc438138010"),
    david: objectId("699cd9aafce6ccc438138011"),
    matilde: objectId("699cd9aafce6ccc438138012"),
  },
  categories: {
    produce: objectId("699cd9aafce6ccc438200001"),
    pantry: objectId("699cd9aafce6ccc438200002"),
    services: objectId("699cd9aafce6ccc438200003"),
  },
  attributes: {
    color: objectId("699cd9aafce6ccc438210001"),
    weight: objectId("699cd9aafce6ccc438210002"),
  },
  products: {
    oranges: objectId("699cd9aafce6ccc438220001"),
    cocoa: objectId("699cd9aafce6ccc438220002"),
    delivery: objectId("699cd9aafce6ccc438220003"),
    plantain: objectId("699cd9aafce6ccc438220004"),
    manioc: objectId("699cd9aafce6ccc438220005"),
    poivre: objectId("699cd9aafce6ccc438220006"),
    safou: objectId("699cd9aafce6ccc438220007"),
    ndole: objectId("699cd9aafce6ccc438220008"),
    bobolo: objectId("699cd9aafce6ccc438220009"),
  },
};

const staff = [
  {
    _id: ids.admins.super,
    name: { en: "Super Admin", display: "Super Admin" },
    email: "admin@satandbuy.local",
    phone: "+237-690-000-000",
    password: bcrypt.hashSync("Admin@123"),
    role: "Admin",
    status: "Active",
    joiningDate: new Date("2025-01-15T08:00:00Z"),
    image:
      "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/staff/super-admin.png",
  },
  {
    _id: ids.admins.operations,
    name: { en: "SATURIN PENLAP KAMDEM" },
    email: "penlapsaturin@gmail.com",
    phone: "655065494",
    password: bcrypt.hashSync("Console@123"),
    role: "Trieur",
    status: "Active",
    joiningDate: new Date("2025-02-10T09:30:00Z"),
    image:
      "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/staff/operations.png",
  },
  {
    _id: ids.admins.driver,
    name: { en: "Nadine Essono" },
    email: "nadine.essono@satandbuy.local",
    phone: "+237-699-112-233",
    password: bcrypt.hashSync("Driver@123"),
    role: "Livreur",
    status: "Active",
    joiningDate: new Date("2025-02-05T07:45:00Z"),
    image:
      "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/staff/driver.png",
    availabilitySlots: [...DEFAULT_DRIVER_SLOTS],
  },
];

const customers = [
  {
    _id: ids.customers.patricia,
    name: "Patricia Tchamda",
    email: "patricia@satandbuy.local",
    phone: "+237-699-000-100",
    password: bcrypt.hashSync("Client@123"),
    image:
      "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/customers/patricia.png",
  },
  {
    _id: ids.customers.david,
    name: "David Nganso",
    email: "david@satandbuy.local",
    phone: "+237-677-220-112",
    password: bcrypt.hashSync("Client@123"),
    image:
      "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/customers/david.png",
  },
  {
    _id: ids.customers.matilde,
    name: "Matilde Koung",
    email: "matilde@satandbuy.local",
    phone: "+237-698-443-221",
    password: bcrypt.hashSync("Client@123"),
  },
];

const languages = [
  {
    _id: objectId(),
    name: "English",
    iso_code: "en",
    flag: "https://flagcdn.com/w40/gb.png",
    status: "show",
  },
  {
    _id: objectId(),
    name: "Français",
    iso_code: "fr",
    flag: "https://flagcdn.com/w40/fr.png",
    status: "show",
  },
];

const currencies = [
  {
    _id: objectId(),
    name: "FCFA",
    symbol: "FCFA",
    status: "show",
    live_exchange_rates: "hide",
  },
  {
    _id: objectId(),
    name: "USD",
    symbol: "$",
    status: "hide",
    live_exchange_rates: "hide",
  },
];

const attributes = [
  {
    _id: ids.attributes.color,
    title: { en: "Color", fr: "Couleur" },
    name: { en: "color", fr: "couleur" },
    option: "Dropdown",
    type: "attribute",
    status: "show",
    variants: [
      {
        name: { en: "Sunset Orange", fr: "Orange vif" },
        hexCode: "#f77f00",
        status: "show",
      },
      {
        name: { en: "Forest Green", fr: "Vert forêt" },
        hexCode: "#2a6f4b",
        status: "show",
      },
    ],
  },
  {
    _id: ids.attributes.weight,
    title: { en: "Weight", fr: "Poids" },
    name: { en: "weight", fr: "poids" },
    option: "Dropdown",
    type: "attribute",
    status: "show",
    variants: [
      {
        name: { en: "1 kg bag", fr: "Sachet 1 kg" },
        status: "show",
      },
      {
        name: { en: "2 kg bag", fr: "Sachet 2 kg" },
        status: "show",
      },
    ],
  },
];

const categories = [
  {
    _id: ids.categories.produce,
    name: { en: "Fresh Produce", fr: "Fruits et légumes" },
    description: {
      en: "Local farmers' fruits and vegetables harvested every morning.",
      fr: "Fruits et légumes des producteurs locaux récoltés chaque matin.",
    },
    slug: "fresh-produce",
    icon: "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/icons/fresh-produce.png",
    status: "show",
  },
  {
    _id: ids.categories.pantry,
    name: { en: "Pantry Staples", fr: "Épicerie" },
    description: {
      en: "Cocoa, grains and all everyday staples.",
      fr: "Cacao, céréales et autres produits du quotidien.",
    },
    slug: "pantry-staples",
    icon: "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/icons/pantry.png",
    status: "show",
  },
  {
    _id: ids.categories.services,
    name: { en: "Services", fr: "Services" },
    description: {
      en: "Planning, delivery assistance and store services.",
      fr: "Planification, assistance de livraison et services magasin.",
    },
    slug: "store-services",
    icon: "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/icons/services.png",
    status: "show",
  },
  {
    _id: objectId("699cd9aafce6ccc438200004"),
    name: { en: "Tubers & Roots", fr: "Tubercules et Racines" },
    description: {
      en: "Plantains, yams, and cassava from Cameroonian soil.",
      fr: "Plantains, macabos, et manioc du terroir camerounais.",
    },
    slug: "tubers-roots",
    icon: "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/icons/tubers.png",
    status: "show",
  },
  {
    _id: objectId("699cd9aafce6ccc438200005"),
    name: { en: "Local Spices", fr: "Épices du pays" },
    description: {
      en: "Penja pepper and other aromatic treasures.",
      fr: "Poivre de Penja et autres trésors aromatiques.",
    },
    slug: "local-spices",
    icon: "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/icons/spices.png",
    status: "show",
  },
];

const products = [
  {
    _id: ids.products.oranges,
    sku: "SKU-ORANGE-001",
    barcode: "OR-2024-1001",
    title: { en: "Sunset Oranges", fr: "Oranges Sunset" },
    description: {
      en: "Sweet oranges sourced from the Moungo valley, perfect for juice.",
      fr: "Oranges sucrées du Moungo, idéales pour vos jus.",
    },
    slug: "sunset-oranges",
    categories: [ids.categories.produce],
    category: ids.categories.produce,
    image: [
      "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/products/sunset-oranges.png",
    ],
    stock: 120,
    sales: 58,
    tag: ["fruits", "local"],
    prices: {
      originalPrice: 4500,
      price: 3800,
      discount: 700,
    },
    variants: [
      {
        attribute: ids.attributes.weight.toString(),
        value: "1 kg bag",
        price: 3800,
      },
    ],
    isCombination: false,
    type: "physical",
    status: "show",
    approvalStatus: "approved",
    approvedAt: new Date("2025-02-10T09:00:00Z"),
    approvedBy: ids.admins.super,
  },
  {
    _id: ids.products.cocoa,
    sku: "SKU-COCOA-010",
    barcode: "COCOA-2024-10",
    title: { en: "Savane Cocoa Powder", fr: "Poudre de cacao Savane" },
    description: {
      en: "Premium cocoa powder for baking and breakfast beverages.",
      fr: "Poudre de cacao premium pour pâtisserie et boissons chaudes.",
    },
    slug: "savane-cocoa",
    categories: [ids.categories.pantry],
    category: ids.categories.pantry,
    image: [
      "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/products/cocoa.png",
    ],
    stock: 85,
    sales: 34,
    tag: ["cocoa", "breakfast"],
    prices: {
      originalPrice: 6500,
      price: 5900,
      discount: 600,
    },
    variants: [
      {
        attribute: ids.attributes.weight.toString(),
        value: "500 g box",
        price: 5900,
      },
    ],
    isCombination: false,
    type: "physical",
    status: "show",
    approvalStatus: "approved",
    approvedAt: new Date("2025-02-11T08:30:00Z"),
    approvedBy: ids.admins.super,
  },
  {
    _id: ids.products.delivery,
    sku: "SKU-SERVICE-001",
    barcode: "SRV-DELIVERY-01",
    title: {
      en: "Same-Day Delivery Assistance",
      fr: "Assistance livraison jour même",
    },
    description: {
      en: "Planning + driver coordination for your urgent deliveries.",
      fr: "Planification et coordination chauffeur pour vos livraisons urgentes.",
    },
    slug: "same-day-delivery",
    categories: [ids.categories.services],
    category: ids.categories.services,
    image: [
      "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/products/delivery-service.png",
    ],
    stock: 999,
    sales: 12,
    tag: ["service", "delivery"],
    prices: {
      originalPrice: 8000,
      price: 6000,
      discount: 2000,
    },
    variants: [],
    isCombination: false,
    type: "service",
    serviceDetails: {
      deliveryMode: "hybrid",
      durationValue: 1,
      durationUnit: "days",
      location: "Douala",
      resources: "Planning team + driver",
      notes: "Include call to customer before arrival.",
      priceIncludes: "Planning, follow-up and proof of delivery.",
    },
    status: "show",
    approvalStatus: "approved",
    approvedAt: new Date("2025-02-12T08:00:00Z"),
    approvedBy: ids.admins.super,
  },
  {
    _id: ids.products.plantain,
    sku: "SKU-PLANT-001",
    barcode: "PL-CAM-001",
    title: { en: "Mbalmayo Plantain", fr: "Plantain de Mbalmayo" },
    description: {
      en: "Big, sweet yellow plantains from Mbalmayo region.",
      fr: "Gros plantains jaunes et sucrés de Mbalmayo.",
    },
    slug: "mbalmayo-plantain",
    categories: [objectId("699cd9aafce6ccc438200004")],
    category: objectId("699cd9aafce6ccc438200004"),
    image: [
      "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/products/plantain.png",
    ],
    stock: 500,
    sales: 150,
    tag: ["local", "staple"],
    prices: {
      originalPrice: 2500,
      price: 2000,
      discount: 500,
    },
    variants: [],
    isCombination: false,
    type: "physical",
    status: "show",
    approvalStatus: "approved",
    approvedAt: new Date(),
    approvedBy: ids.admins.super,
  },
  {
    _id: ids.products.poivre,
    sku: "SKU-PENJA-001",
    barcode: "PJ-POIVRE-001",
    title: { en: "White Penja Pepper", fr: "Poivre Blanc de Penja" },
    description: {
      en: "World famous IG pepper from the Penja volcanic soil.",
      fr: "Le mondialement célèbre poivre IGP de Penja, sol volcanique.",
    },
    slug: "penja-white-pepper",
    categories: [objectId("699cd9aafce6ccc438200005")],
    category: objectId("699cd9aafce6ccc438200005"),
    image: [
      "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/products/penja.png",
    ],
    stock: 50,
    sales: 22,
    tag: ["luxury", "spice"],
    prices: {
      originalPrice: 15000,
      price: 13500,
      discount: 1500,
    },
    variants: [],
    isCombination: false,
    type: "physical",
    status: "show",
    approvalStatus: "approved",
    approvedAt: new Date(),
    approvedBy: ids.admins.super,
  },
  {
    _id: ids.products.safou,
    sku: "SKU-SAFOU-001",
    barcode: "SF-CAM-001",
    title: { en: "Purple Safou (Prunes)", fr: "Safous Violets (Prunes)" },
    description: {
      en: "Fleshy purple safous, perfect when roasted or boiled.",
      fr: "Safous pulpeux, parfaits grillés ou bouillis.",
    },
    slug: "safou-purple",
    categories: [ids.categories.produce],
    category: ids.categories.produce,
    image: [
      "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/products/safou.png",
    ],
    stock: 200,
    sales: 80,
    tag: ["local", "seasonal"],
    prices: {
      originalPrice: 1500,
      price: 1200,
      discount: 300,
    },
    variants: [],
    isCombination: false,
    type: "physical",
    status: "show",
    approvalStatus: "approved",
    approvedAt: new Date(),
    approvedBy: ids.admins.super,
  },
  {
    _id: ids.products.ndole,
    sku: "SKU-NDOLE-001",
    barcode: "ND-CAM-001",
    title: { en: "Dried Ndolé Leaves", fr: "Feuilles de Ndolé séchées" },
    description: {
      en: "Premium washed and dried Ndolé leaves from the Littoral region.",
      fr: "Feuilles de Ndolé lavées et séchées, qualité supérieure du Littoral.",
    },
    slug: "dried-ndole",
    categories: [ids.categories.pantry],
    category: ids.categories.pantry,
    image: [
      "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/products/ndole.png",
    ],
    stock: 300,
    sales: 45,
    tag: ["local", "vegetable"],
    prices: {
      originalPrice: 2000,
      price: 1800,
      discount: 200,
    },
    variants: [],
    isCombination: false,
    type: "physical",
    status: "show",
    approvalStatus: "approved",
    approvedAt: new Date(),
    approvedBy: ids.admins.super,
  },
  {
    _id: ids.products.bobolo,
    sku: "SKU-BOBOLO-001",
    barcode: "BB-CAM-001",
    title: { en: "Fresh Bobolo (Cassava Stick)", fr: "Bobolo Frais (Bâton de Manioc)" },
    description: {
      en: "Traditional fermented cassava sticks, 40-50cm long.",
      fr: "Bâtons de manioc fermentés traditionnels, 40-50cm.",
    },
    slug: "fresh-bobolo",
    categories: [objectId("699cd9aafce6ccc438200004")],
    category: objectId("699cd9aafce6ccc438200004"),
    image: [
      "https://res.cloudinary.com/dhatnll1d/image/upload/v1708368000/products/bobolo.png",
    ],
    stock: 1000,
    sales: 450,
    tag: ["local", "staple"],
    prices: {
      originalPrice: 1000,
      price: 800,
      discount: 200,
    },
    variants: [],
    isCombination: false,
    type: "physical",
    status: "show",
    approvalStatus: "approved",
    approvedAt: new Date(),
    approvedBy: ids.admins.super,
  },
];

const coupons = [
  {
    _id: objectId(),
    title: {
      en: "Market Day -10%",
      fr: "Marché du jour -10%",
    },
    couponCode: "MARCHE10",
    startTime: new Date("2025-02-01T00:00:00Z"),
    endTime: new Date("2025-12-31T21:59:59Z"),
    discountType: { type: "percentage", value: 10 },
    minimumAmount: 10000,
    productType: "all",
    status: "show",
  },
  {
    _id: objectId(),
    title: {
      en: "Delivery Combo 1500 FCFA",
      fr: "Pack livraison 1500 FCFA",
    },
    couponCode: "LIVR1500",
    startTime: new Date("2025-02-05T00:00:00Z"),
    endTime: new Date("2025-08-31T21:59:59Z"),
    discountType: { type: "flat", value: 1500 },
    minimumAmount: 7500,
    productType: "service",
    status: "show",
  },
];

const buildCartItem = (slug, quantity) => {
  const product = products.find((item) => item.slug === slug);
  if (!product) {
    throw new Error(`Product with slug ${slug} not found for cart`);
  }
  return {
    _id: product._id,
    productId: product._id.toString(),
    title: product.title,
    slug: product.slug,
    sku: product.sku,
    quantity,
    image: product.image,
    prices: { ...product.prices },
    categories: product.categories,
    tag: product.tag,
    variants: product.variants,
    type: product.type,
  };
};

const sumCart = (cart = []) =>
  cart.reduce(
    (acc, item) => acc + (item.prices?.price || 0) * (item.quantity || 1),
    0
  );

const buildSortingItems = (cart, override = {}) =>
  cart.map((item) => {
    const key = item.slug || item.productId;
    const data = override[key] || {};
    return {
      productId: item.productId,
      title: item.title,
      sku: item.sku,
      image: Array.isArray(item.image) ? item.image[0] : item.image,
      quantity: item.quantity,
      status: data.status || "Pending",
      notes: data.notes || "",
      checkedBy: data.checkedBy,
      checkedAt: data.checkedAt,
    };
  });

const shippingRates = [
  {
    _id: objectId(),
    country: "Cameroon",
    city: "Douala",
    label: "Douala Express",
    description: "Akwa, Bonanjo, Bonapriso et Bonamoussadi",
    estimatedTime: "24h",
    cost: 1500,
    status: "active",
    approvalStatus: "approved",
    approvedBy: ids.admins.super,
    approvedAt: new Date("2025-02-10T08:00:00Z"),
  },
  {
    _id: objectId(),
    country: "Cameroon",
    city: "Yaoundé",
    label: "Yaoundé Standard",
    description: "Centre-ville, Bastos, Biyem-Assi",
    estimatedTime: "48h",
    cost: 2500,
    status: "active",
    approvalStatus: "approved",
    approvedBy: ids.admins.super,
    approvedAt: new Date("2025-02-10T08:00:00Z"),
  },
];

const orderOneCart = [
  buildCartItem("sunset-oranges", 2),
  buildCartItem("savane-cocoa", 1),
];
const orderOneSubTotal = sumCart(orderOneCart);

const orderTwoCart = [
  buildCartItem("sunset-oranges", 1),
  buildCartItem("same-day-delivery", 1),
];
const orderTwoSubTotal = sumCart(orderTwoCart);

const orders = [
  {
    _id: objectId(),
    user: ids.customers.patricia,
    cart: orderOneCart,
    user_info: {
      name: "Patricia Tchamda",
      email: "patricia@satandbuy.local",
      contact: "+237-699-000-100",
      address: "Immeuble Sonata, Bonapriso",
      city: "Douala",
      country: "Cameroon",
      zipCode: "BP 125",
    },
    subTotal: orderOneSubTotal,
    shippingCost: 1500,
    discount: 500,
    total: orderOneSubTotal + 1500 - 500,
    shippingOption: "Douala Express",
    paymentMethod: "cash_on_delivery",
    cardInfo: null,
    status: "Processing",
    sorting: {
      assignedTo: ids.admins.operations,
      status: "InProgress",
      notes: "",
      startedAt: new Date("2025-02-18T08:30:00Z"),
      items: buildSortingItems(orderOneCart, {
        "sunset-oranges": {
          status: "Checked",
          checkedBy: ids.admins.operations,
          checkedAt: new Date("2025-02-18T09:00:00Z"),
        },
      }),
    },
    deliveryPlan: {
      status: "Scheduled",
      driverId: ids.admins.driver,
      assignedDriver: "Nadine Essono",
      deliveryDate: new Date("2025-02-19T14:00:00Z"),
      deliveryWindow: "14:00 - 16:00",
      notes: "Prévenir le client 10 minutes avant l'arrivée.",
      confirmedByCustomer: false,
    },
  },
  {
    _id: objectId(),
    user: ids.customers.david,
    cart: orderTwoCart,
    user_info: {
      name: "David Nganso",
      email: "david@satandbuy.local",
      contact: "+237-677-220-112",
      address: "Carrefour Bastos",
      city: "Yaoundé",
      country: "Cameroon",
      zipCode: "BP 220",
    },
    subTotal: orderTwoSubTotal,
    shippingCost: 2500,
    discount: 0,
    total: orderTwoSubTotal + 2500,
    shippingOption: "Yaoundé Standard",
    paymentMethod: "mobile_money",
    cardInfo: { provider: "Orange Money", reference: "OM-2025-7788" },
    status: "Delivered",
    sorting: {
      assignedTo: ids.admins.operations,
      status: "Completed",
      notes: "Contrôlé et scellé.",
      startedAt: new Date("2025-02-12T07:45:00Z"),
      completedAt: new Date("2025-02-12T09:10:00Z"),
      items: buildSortingItems(orderTwoCart, {
        "sunset-oranges": {
          status: "Checked",
          checkedBy: ids.admins.operations,
          checkedAt: new Date("2025-02-12T08:10:00Z"),
        },
        "same-day-delivery": {
          status: "Checked",
          checkedBy: ids.admins.operations,
          checkedAt: new Date("2025-02-12T08:30:00Z"),
        },
      }),
    },
    deliveryPlan: {
      status: "Delivered",
      driverId: ids.admins.driver,
      assignedDriver: "Nadine Essono",
      deliveryDate: new Date("2025-02-13T16:00:00Z"),
      deliveryWindow: "15:00 - 17:00",
      notes: "Paquet remis à la réception.",
      confirmedByCustomer: true,
      confirmedAt: new Date("2025-02-13T16:30:00Z"),
    },
  },
];

module.exports = {
  ids,
  authSeeds: {
    admins: staff,
    customers,
  },
  catalogSeeds: {
    languages,
    currencies,
    attributes,
    categories,
    products,
    coupons,
  },
  orderSeeds: {
    shippingRates,
    orders,
  },
  settingsSeeds: [
    {
      name: "globalSetting",
      setting: {
        shop_name: "Sat & Buy",
        address: "Akwa, Douala, Cameroon",
        contact: "+237 690 000 000",
        email: "contact@satandbuy.cm",
        default_currency: "FCFA",
        default_language: "fr",
        floating_number: 0,
      },
    },
    {
      name: "storeCustomizationSetting",
      setting: {
        footer: {
          block1_status: true,
          block1_title: { en: "Company", fr: "Entreprise" },
          block1_sub_title1: { en: "About Us", fr: "À propos" },
          block1_sub_link1: "/about-us",
          block1_sub_title2: { en: "Contact Us", fr: "Contactez-nous" },
          block1_sub_link2: "/contact-us",

          block4_status: true,
          block4_address: "Douala, Cameroon",
          block4_phone: "+237 690 000 000",
          block4_email: "contact@satandbuy.cm",

          social_links_status: true,
          social_facebook: "https://facebook.com/satandbuy",
          social_twitter: "https://twitter.com/satandbuy",

          bottom_contact_status: true,
          bottom_contact: "+237 690 000 000",
        },
        home: {
          popular_products_status: true,
          discount_product_status: true,
          featured_status: true,
          popular_title: { en: "Popular in Cameroon", fr: "Populaire au Cameroun" },
          latest_discount_title: { en: "Best Deals", fr: "Meilleures Offres" }
        },
        contact_us: {
          title: { en: "Contact Us", fr: "Contactez-nous" },
          header_bg: "/contact-header-bg.png",
          email_box_title: { en: "Email Us", fr: "Envoyez-nous un email" },
          email_box_email: { en: "contact@satandbuy.cm", fr: "contact@satandbuy.cm" },
          email_box_text: { en: "Interactively grow empowered for process-centric total linkage.", fr: "Nous sommes disponibles pour répondre à toutes vos questions." },
          call_box_title: { en: "Call Us", fr: "Appelez-nous" },
          call_box_phone: { en: "+237 690 000 000", fr: "+237 690 000 000" },
          call_box_text: { en: "Distinctively disseminate focused solutions clicks-and-mortar ministate.", fr: "Notre service client est à votre écoute 24h/24 et 7j/7." },
          address_box_title: { en: "Location", fr: "Localisation" },
          address_box_address_one: { en: "Akwa, Douala", fr: "Akwa, Douala" },
          address_box_address_two: { en: "Cameroon", fr: "Cameroun" },
          address_box_address_three: { en: "BP 125", fr: "BP 125" },
          midLeft_col_img: "/contact-us.png",
          form_title: { en: "For any support, leave us a message", fr: "Pour toute assistance, laissez-nous un message" },
          form_description: { en: "We'd love to hear from you! Please fill out the form below.", fr: "Nous serons ravis de vous lire ! Veuillez remplir le formulaire ci-dessous." }
        }
      },
    },
  ],
};
