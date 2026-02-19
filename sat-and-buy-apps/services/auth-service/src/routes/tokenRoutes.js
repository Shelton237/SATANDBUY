"use strict";

const router = require("express").Router();
const controller = require("../controllers/tokenController");

router.post("/refresh", controller.refresh);
router.post("/revoke", controller.revoke);

module.exports = router;
