const express = require("express");
const router = express.Router();
const reportController = require("../../../controllers/reports/report.controller");
const verifyToken = require("../../../middlewares/auth/verifyToken");
const validate = require("../../../middlewares/validate/validate");
const reportValidation = require("../../../validations/report.validation");

router.post(
  "/",
  verifyToken,
  validate(reportValidation.createReportSchema),
  reportController.createReport
);

module.exports = router;