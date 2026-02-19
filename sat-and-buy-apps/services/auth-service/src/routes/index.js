"use strict";

const router = require("express").Router();

router.use("/admin", require("./adminRoutes"));
router.use("/customer", require("./customerRoutes"));
router.use("/token", require("./tokenRoutes"));

module.exports = router;
