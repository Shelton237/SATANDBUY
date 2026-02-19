"use strict";

const router = require("express").Router();

router.get("/", (req, res) => {
  res.send({
    service: "auth-service",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
