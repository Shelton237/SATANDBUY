"use strict";

const router = require("express").Router();
const deliveryDomain = require("@satandbuy/delivery-domain");

const {
  normalizeDateOnly,
  ensureDriverBooking,
  releaseDriverSlotsByOrder,
  getTakenSlotsForDriver,
} = deliveryDomain.lib;

router.get("/drivers/:driverId/slots", async (req, res) => {
  try {
    const { driverId } = req.params;
    const { date, excludeOrderId } = req.query;
    const normalizedDate = normalizeDateOnly(date);

    if (!normalizedDate) {
      return res.status(400).send({ message: "Date invalide." });
    }

    const slots = await getTakenSlotsForDriver({
      driverId,
      date: normalizedDate,
      excludeOrderId,
    });

    res.send({ slots });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post("/assignments", async (req, res) => {
  try {
    const { orderId, driverId, date, slot } = req.body;
    const normalizedDate = normalizeDateOnly(date);
    if (!orderId || !driverId || !normalizedDate || !slot) {
      return res.status(400).send({
        message: "orderId, driverId, date et slot sont requis.",
      });
    }

    const booking = await ensureDriverBooking({
      orderId,
      driverId,
      date: normalizedDate,
      slot,
    });

    res.status(201).send({
      message: "Créneau réservé.",
      booking,
    });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).send({ message: err.message });
  }
});

router.delete("/assignments/:orderId", async (req, res) => {
  try {
    await releaseDriverSlotsByOrder(req.params.orderId, "api_release");
    res.send({ message: "Créneau libéré." });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
