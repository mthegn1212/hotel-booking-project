const reportService = require("../../services/report.service");

exports.createReport = async (req, res) => {
  try {
    const report = await reportService.createReport(req.user.id, req.body);
    res.status(201).json({ message: "Report submitted", report });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};