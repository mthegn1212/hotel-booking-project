const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/owners/ownerRequest.controller");
const verifyToken = require("../../../middlewares/auth/verifyToken");
const checkRole = require("../../../middlewares/auth/checkRole");
const validate = require("../../../middlewares/validate");
const ownerRequestValidation = require("../../../validations/ownerRequest.validation");

// Customer gửi request
router.post(
  "/request",
  verifyToken,
  checkRole("customer"),
  validate(ownerRequestValidation.requestOwnerSchema),
  controller.requestOwner
);

// Admin duyệt / từ chối / xem
router.get("/", verifyToken, checkRole("admin"), controller.getAllRequests);
router.post(
  "/:id/approve",
  verifyToken,
  checkRole("admin"),
  validate(ownerRequestValidation.objectIdSchema, "params"),
  controller.approveRequest
);
router.post(
  "/:id/reject",
  verifyToken,
  checkRole("admin"),
  validate(ownerRequestValidation.objectIdSchema, "params"),
  controller.rejectRequest
);

module.exports = router;