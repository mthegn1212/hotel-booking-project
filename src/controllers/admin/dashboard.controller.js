const Booking = require("../../models/booking.model");

exports.getBookingStats = async (req, res) => {
  const data = await Booking.aggregate([
    {
      $match: {
        status: "confirmed",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(data);
};
