const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/owners/ownerRequest.controller");
const verifyToken = require("../../../middlewares/auth/verifyToken");
const checkRole = require("../../../middlewares/auth/checkRole");

router.post("/request", verifyToken, checkRole("customer"), controller.requestOwner);

// Admin duyệt
router.get("/", verifyToken, checkRole("admin"), controller.getAllRequests);
router.post("/:id/approve", verifyToken, checkRole("admin"), controller.approveRequest);
router.post("/:id/reject", verifyToken, checkRole("admin"), controller.rejectRequest);

module.exports = router;