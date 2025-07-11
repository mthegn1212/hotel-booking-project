const express = require("express");
const router = express.Router();
const verifyToken = require("../../../middlewares/auth/verifyToken");
const checkRole = require("../../../middlewares/auth/checkRole");
const dashboard = require("../../../controllers/admin/dashboard.controller");

router.get("/booking-stats", verifyToken, checkRole("admin"), dashboard.getBookingStats);

module.exports = router;