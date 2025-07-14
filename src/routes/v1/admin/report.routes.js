const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/admin/report.controller");
const verifyToken = require("../../../middlewares/auth/verifyToken");
const checkRole = require("../../../middlewares/auth/checkRole");
const validate = require("../../../middlewares/validate/validate");
const reportValidation = require("../../../validations/report.validation");

router.get("/", verifyToken, checkRole("admin"), controller.getAllReports);
router.get(
  "/:id",
  verifyToken,
  checkRole("admin"),
  validate(reportValidation.reportIdSchema, "params"),
  controller.getReportById
);
router.delete("/:id", verifyToken, checkRole("admin"), controller.deleteReport);

module.exports = router;