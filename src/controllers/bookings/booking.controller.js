const Booking = require("../../models/booking.model");
const Room = require("../../models/room.model");

exports.createBooking = async (req, res) => {
  const { room_id, start_date, end_date } = req.body;
  const user_id = req.user.id;

  const start = new Date(start_date);
  const end = new Date(end_date);
  const days = (end - start) / (1000 * 60 * 60 * 24);
    // Kiểm tra ngày hợp lệ
  const today = new Date();

  if (new Date(start_date) < today || new Date(end_date) < today) {
    return res.status(400).json({
      message: "Không thể đặt phòng trong quá khứ!",
    });
  }

  if (new Date(start_date) >= new Date(end_date)) {
    return res.status(400).json({
      message: "Ngày kết thúc phải sau ngày bắt đầu!",
    });
  }
  
  if (days <= 0) return res.status(400).json({ message: "Ngày không hợp lệ" });

  const room = await Room.findById(room_id);
  if (!room) return res.status(404).json({ message: "Phòng không tồn tại" });

  const isBooked = await Booking.findOne({
    room_id,
    status: { $ne: "cancelled" },
    $or: [
      { start_date: { $lt: end }, end_date: { $gt: start } },
      { start_date: { $gte: start, $lt: end } }
    ]
  });

  if (isBooked) return res.status(400).json({ message: "Phòng đã được đặt trong thời gian này" });

  const total_price = days * room.price;

  const booking = await Booking.create({
    user_id,
    room_id,
    start_date: start,
    end_date: end,
    total_price,
    expires_at: new Date(Date.now() + 3600000), // Hết hạn sau 1 giờ
  });

  res.status(201).json({ message: "Đặt phòng thành công", booking });
};

exports.getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user_id: req.user.id }).populate("room_id");
  res.json(bookings);
};

exports.cancelBooking = async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user_id: req.user.id });
  if (!booking) return res.status(404).json({ message: "Không tìm thấy booking" });

  booking.status = "cancelled";
  await booking.save();
  res.json({ message: "Đã huỷ booking" });
};