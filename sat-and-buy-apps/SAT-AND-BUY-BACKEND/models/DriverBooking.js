const mongoose = require("mongoose");

const driverBookingSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    slot: {
      type: String,
      required: true,
      trim: true,
    },
    startMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    endMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["booked", "released"],
      default: "booked",
    },
    releaseReason: {
      type: String,
      default: "",
    },
    releasedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

driverBookingSchema.index(
  { driver: 1, date: 1, slot: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "booked" },
  }
);

const DriverBooking = mongoose.model("DriverBooking", driverBookingSchema);
module.exports = DriverBooking;
