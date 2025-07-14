const Report = require("../models/report.model");

exports.getAllReports = async () => {
  return await Report.find().populate("user_id", "name email").sort({ createdAt: -1 });
};

exports.getReportById = async (id) => {
  const report = await Report.findById(id);
  if (!report) throw new Error("Report not found");
  return report;
};

exports.createReport = async (userId, body) => {
  const { target_type, target_id, reason } = body;

  const newReport = await Report.create({
    user_id: userId,
    target_type,
    target_id,
    reason,
  });

  return newReport;
};

exports.deleteReport = async (id) => {
  const report = await Report.findById(id);
  if (!report) throw new Error("Report not found");

  await report.remove();
};