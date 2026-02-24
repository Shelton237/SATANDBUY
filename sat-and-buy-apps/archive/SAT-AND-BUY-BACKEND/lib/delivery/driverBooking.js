const mongoose = require("mongoose");
const DriverBooking = require("../../models/DriverBooking");

const normalizeDateOnly = (value) => {
  if (!value) return null;
  const date =
    value instanceof Date
      ? new Date(value.getTime())
      : new Date(typeof value === "number" ? value : `${value}`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

const parseSlotRange = (slot = "") => {
  if (typeof slot !== "string") {
    throw new Error("Créneau invalide.");
  }
  const [rawStart = "", rawEnd = ""] = slot.split("-");
  const start = rawStart.trim();
  const end = rawEnd.trim();

  const toMinutes = (value) => {
    const [h, m] = value.split(":").map((v) => parseInt(v, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) {
      return null;
    }
    return h * 60 + m;
  };

  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);

  if (
    startMinutes === null ||
    endMinutes === null ||
    endMinutes <= startMinutes
  ) {
    throw new Error("Plage horaire invalide.");
  }

  return { start, end, startMinutes, endMinutes };
};

const releaseDriverSlotsByOrder = async (orderId, reason = "status_change") => {
  if (!orderId) return;
  await DriverBooking.updateMany(
    { order: orderId, status: "booked" },
    {
      status: "released",
      releaseReason: reason,
      releasedAt: new Date(),
    }
  );
};

const ensureDriverBooking = async ({ orderId, driverId, date, slot }) => {
  if (!orderId || !driverId || !date || !slot) return null;

  const { startMinutes, endMinutes } = parseSlotRange(slot);

  const existing = await DriverBooking.findOne({
    order: orderId,
    status: "booked",
  });

  const sameBooking =
    existing &&
    existing.driver.toString() === driverId.toString() &&
    existing.slot === slot &&
    existing.date.getTime() === date.getTime();

  if (sameBooking) {
    return existing;
  }

  await releaseDriverSlotsByOrder(orderId, "rescheduled");

  const overlap = await DriverBooking.findOne({
    driver: driverId,
    date,
    status: "booked",
    startMinutes: { $lt: endMinutes },
    endMinutes: { $gt: startMinutes },
  });

  if (overlap && overlap.order.toString() !== orderId.toString()) {
    const conflictError = new Error(
      "Ce créneau chevauche une autre livraison pour ce livreur."
    );
    conflictError.statusCode = 409;
    throw conflictError;
  }

  const booking = await DriverBooking.create({
    driver: driverId,
    order: orderId,
    date,
    slot,
    startMinutes,
    endMinutes,
  });
  return booking;
};

const getTakenSlotsForDriver = async ({
  driverId,
  date,
  excludeOrderId = null,
}) => {
  if (!driverId || !date) return [];
  const query = {
    driver: driverId,
    date,
    status: "booked",
  };
  if (excludeOrderId && mongoose.Types.ObjectId.isValid(excludeOrderId)) {
    query.order = { $ne: excludeOrderId };
  }
  const bookings = await DriverBooking.find(query)
    .select("slot order startMinutes endMinutes")
    .lean();
  return bookings;
};

module.exports = {
  normalizeDateOnly,
  parseSlotRange,
  releaseDriverSlotsByOrder,
  ensureDriverBooking,
  getTakenSlotsForDriver,
};
