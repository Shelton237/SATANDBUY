const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: false,
    },
    sku: {
      type: String,
      required: false,
    },
    barcode: {
      type: String,
      required: false,
    },
    title: {
      type: Object,
      required: true,
    },
    description: {
      type: Object,
      required: false,
    },
    slug: {
      type: String,
      required: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    image: {
      type: Array,
      required: false,
    },
    stock: {
      type: Number,
      required: false,
    },

    sales: {
      type: Number,
      required: false,
    },

    tag: [String],
    prices: {
      originalPrice: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        required: false,
      },
    },
    variants: [{}],
    isCombination: {
      type: Boolean,
      required: true,
    },

    type: {
      type: String,
      enum: ["physical", "service"],
      default: "physical",
      lowercase: true,
      trim: true,
    },
    serviceDetails: {
      deliveryMode: {
        type: String,
        enum: ["onsite", "online", "hybrid"],
        lowercase: true,
        trim: true,
      },
      durationValue: {
        type: Number,
      },
      durationUnit: {
        type: String,
        enum: ["minutes", "hours", "days"],
        lowercase: true,
        trim: true,
      },
      location: {
        type: String,
        trim: true,
      },
      resources: {
        type: String,
        trim: true,
      },
      notes: {
        type: String,
        trim: true,
      },
      priceIncludes: {
        type: String,
        trim: true,
      },
    },

    status: {
      type: String,
      default: "show",
      enum: ["show", "hide"],
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// module.exports = productSchema;

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
