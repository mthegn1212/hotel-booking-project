const reportService = require("../../services/report.service");

exports.getAllReports = async (req, res) => {
  try {
    const reports = await reportService.getAllReports();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await reportService.getReportById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    await reportService.deleteReport(req.params.id);
    res.json({ message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};