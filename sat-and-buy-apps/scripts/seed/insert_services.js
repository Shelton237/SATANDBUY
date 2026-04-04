
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

mongoose.connect(process.env.CATALOG_MONGO_URI || "mongodb://root:satandbuy2026@38.242.223.70:27017/satandbuy_catalog?authSource=admin", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to Catalog DB'))
  .catch(err => console.error(err));

// Minimally mocked Category and Product schemas for direct insertion
const CategorySchema = new Schema({
  name: Object,
  slug: String
});
const Category = mongoose.model('Category', CategorySchema, 'categories');

const ProductSchema = new Schema({}, { strict: false });
const Product = mongoose.model('Product', ProductSchema, 'products');

async function seedServices() {
  try {
    const adminId = "60a7e0b5c1a7d6e4b8f5a2a"; // Mock admin id, not strictly necessary if schema allows

    // Try finding the Services category
    let category = await Category.findOne({ slug: "services" });
    if (!category) {
        category = await Category.findOne(); // grab any category if not found
    }

    if (!category) {
       console.log("No category found! Please create one.");
       process.exit(1);
    }

    const services = [
      {
        sku: "SRV-CONS-001",
        title: { en: "Strategic Consultation", fr: "Consultation Stratégique", de: "Strategic Consultation", es: "Strategic Consultation" },
        description: { en: "Analyse complète de votre business.", fr: "Analyse complète de votre business.", de: "", es: "" },
        slug: "consultation-strategique",
        category: category._id,
        categories: [category._id],
        isCombination: false,
        type: "service",
        prices: {
          originalPrice: 25000,
          price: 20000
        },
        serviceDetails: {
          deliveryMode: "online",
          durationValue: 1,
          durationUnit: "hours",
          location: "Google Meet",
          resources: "Connection, Webcam",
          priceIncludes: "Dossier PDF",
          notes: "Merci d'envoyer vos questions en avance"
        },
        status: "show"
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
        prices: {
          originalPrice: 15000,
          price: 12000
        },
        serviceDetails: {
          deliveryMode: "onsite",
          durationValue: 2,
          durationUnit: "hours",
          location: "Bureau client",
          resources: "Accès machines",
          priceIncludes: "Dépoussiérage, scan antivrus",
          notes: ""
        },
        status: "show"
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
        prices: {
          originalPrice: 55000,
          price: 50000
        },
        serviceDetails: {
          deliveryMode: "hybrid",
          durationValue: 3,
          durationUnit: "days",
          location: "Centre de formation / Zoom",
          resources: "PC portable",
          priceIncludes: "Certificat, support de cours",
          notes: "Places limitées"
        },
        status: "show"
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
        prices: {
          originalPrice: 120000,
          price: 100000
        },
        serviceDetails: {
          deliveryMode: "online",
          durationValue: 30,
          durationUnit: "days",
          location: "Slack / Email / Tel",
          resources: "Aucune",
          priceIncludes: "SLA garanti",
          notes: "Abonnement mensuel"
        },
        status: "show"
      }
    ];

    for (let s of services) {
        await Product.updateOne({ slug: s.slug }, { $set: s }, { upsert: true });
        console.log(`Inserted service: ${s.slug}`);
    }

    console.log("4 services registered successfully!");

    mongoose.disconnect();
    process.exit(0);

  } catch(e) {
    console.error(e);
    mongoose.disconnect();
    process.exit(1);
  }
}

seedServices();
