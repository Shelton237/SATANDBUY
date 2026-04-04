db = db.getSiblingDB('satandbuy_catalog');

var category = db.categories.findOne({ slug: "services" });
if (!category) {
    category = db.categories.findOne();
}

if (!category) {
    print("No category found!");
    quit(1);
}

var services = [
  {
    sku: "SRV-CONS-001",
    title: { en: "Strategic Consultation", fr: "Consultation Stratégique", de: "Strategic Consultation", es: "Strategic Consultation" },
    description: { en: "Analyse complète de votre business.", fr: "Analyse complète de votre business.", de: "", es: "" },
    slug: "consultation-strategique",
    category: category._id,
    categories: [category._id],
    isCombination: false,
    type: "service",
    prices: { originalPrice: 25000, price: 20000 },
    serviceDetails: {
      deliveryMode: "online",
      durationValue: 1,
      durationUnit: "hours",
      location: "Google Meet",
      resources: "Connection, Webcam",
      priceIncludes: "Dossier PDF",
      notes: "Merci d'envoyer vos questions en avance"
    },
    status: "show",
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0
  },
  {
    sku: "SRV-MAINT-002",
    title: { en: "IT Maintenance", fr: "Maintenance Informatique", de: "IT Maintenance", es: "IT Maintenance" },
    description: { en: "Nettoyage et optimisation de vos équipements.", fr: "Nettoyage et optimisation de vos équipements.", de: "", es: "" },
    slug: "maintenance-informatique",
    category: category._id,
    categories: [category._id],
    isCombination: false,
    type: "service",
    prices: { originalPrice: 15000, price: 12000 },
    serviceDetails: {
      deliveryMode: "onsite",
      durationValue: 2,
      durationUnit: "hours",
      location: "Bureau client",
      resources: "Accès machines",
      priceIncludes: "Dépoussiérage, scan antivrus",
      notes: ""
    },
    status: "show",
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0
  },
  {
    sku: "SRV-FORM-003",
    title: { en: "Digital Marketing Training", fr: "Formation Marketing Digital" },
    description: { en: "Apprenez à booster vos ventes en ligne.", fr: "Apprenez à booster vos ventes en ligne." },
    slug: "formation-marketing",
    category: category._id,
    categories: [category._id],
    isCombination: false,
    type: "service",
    prices: { originalPrice: 55000, price: 50000 },
    serviceDetails: {
      deliveryMode: "hybrid",
      durationValue: 3,
      durationUnit: "days",
      location: "Centre de formation / Zoom",
      resources: "PC portable",
      priceIncludes: "Certificat, support de cours",
      notes: "Places limitées"
    },
    status: "show",
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0
  },
  {
    sku: "SRV-SUPP-004",
    title: { en: "Premium Tech Support", fr: "Support Technique Premium" },
    description: { en: "Assistance prioritaire 24/7.", fr: "Assistance prioritaire 24/7." },
    slug: "support-premium",
    category: category._id,
    categories: [category._id],
    isCombination: false,
    type: "service",
    prices: { originalPrice: 120000, price: 100000 },
    serviceDetails: {
      deliveryMode: "online",
      durationValue: 30,
      durationUnit: "days",
      location: "Slack / Email / Tel",
      resources: "Aucune",
      priceIncludes: "SLA garanti",
      notes: "Abonnement mensuel"
    },
    status: "show",
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0
  }
];

services.forEach(function(s) {
    db.products.updateOne({ slug: s.slug }, { $set: s }, { upsert: true });
    print("Inserted service: " + s.slug);
});

print("4 services registered successfully via mongosh!");
