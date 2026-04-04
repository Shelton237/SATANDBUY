const { mongo } = require("@satandbuy/shared");
const mongoose = mongo.mongoose;

const ORDER_STATUSES = [
  "Pending",
  "Sorting",
  "ReadyForDelivery",
  "Processing",
  "Delivered",
  "Cancel",
];

const SORTING_STATUSES = ["Pending", "InProgress", "Completed"];
const SORTING_ITEM_STATUSES = ["Pending", "Checked", "Missing"];
const DELIVERY_STATUSES = ["Pending", "Scheduled", "Dispatched", "Delivered"];

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    invoice: {
      type: Number,
      required: false,
    },
    cart: [{}],
    user_info: {
      name: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      contact: {
        type: String,
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      country: {
        type: String,
        required: false,
      },
      zipCode: {
        type: String,
        required: false,
      },
    },
    subTotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
    },
    shippingOption: {
      type: String,
      required: false,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    cardInfo: {
      type: Object,
      required: false,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Pending",
    },
    sorting: {
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
      status: {
        type: String,
        enum: SORTING_STATUSES,
        default: "Pending",
      },
      notes: {
        type: String,
        default: "",
      },
      startedAt: {
        type: Date,
      },
      completedAt: {
        type: Date,
      },
      items: [
        {
          productId: {
            type: String,
            default: "",
          },
          title: {
            type: mongoose.Schema.Types.Mixed,
            default: "",
          },
          sku: {
            type: String,
            default: "",
          },
          image: {
            type: String,
            default: "",
          },
          quantity: {
            type: Number,
            default: 1,
          },
          status: {
            type: String,
            enum: SORTING_ITEM_STATUSES,
            default: "Pending",
          },
          notes: {
            type: String,
            default: "",
          },
          checkedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
          },
          checkedAt: {
            type: Date,
          },
        },
      ],
    },
    deliveryPlan: {
      status: {
        type: String,
        enum: DELIVERY_STATUSES,
        default: "Pending",
      },
      driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
      assignedDriver: {
        type: String,
        default: "",
      },
      deliveryDate: {
        type: Date,
      },
      deliveryWindow: {
        type: String,
        default: "",
      },
      notes: {
        type: String,
        default: "",
      },
      confirmedByCustomer: {
        type: Boolean,
        default: false,
      },
      confirmedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Generate invoice number using a simple, non-blocking counter
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.invoice) {
    try {
      const counter = await mongoose.connection
        .collection("counters")
        .findOneAndUpdate(
          { _id: "orders_invoice" },
          { $inc: { seq: 1 } },
          { upsert: true, returnDocument: "after" }
        );
      this.invoice = counter?.seq ?? counter?.value?.seq ?? 10000;
    } catch (err) {
      // fallback: timestamp-based invoice — never blocks
      console.warn("[Order] counter fallback:", err.message);
      this.invoice = Date.now();
    }
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
