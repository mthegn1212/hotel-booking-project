const dashboardService = require("../../services/dashboard.service");

exports.getBookingStats = async (req, res) => {
  try {
    const data = await dashboardService.getBookingStats();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};