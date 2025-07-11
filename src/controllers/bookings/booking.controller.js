const Booking = require("../../models/booking.model");
const Room = require("../../models/room.model");
const sendEmail = require("../../utils/mailer");
const { getIO } = require("../../socket");

exports.createBooking = async (req, res) => {
  const { room_id, start_date, end_date } = req.body;
  const user_id = req.user.id;
  const start = new Date(start_date);
  const end = new Date(end_date);
  const days = (end - start) / (1000 * 60 * 60 * 24);
  const today = new Date();

  if (start < today || end < today)
    return res.status(400).json({ message: "Không thể đặt phòng trong quá khứ!" });
  if (start >= end)
    return res.status(400).json({ message: "Ngày kết thúc phải sau ngày bắt đầu!" });
  if (days <= 0)
    return res.status(400).json({ message: "Ngày không hợp lệ" });

  const room = await Room.findById(room_id).populate('hotel_id');
  if (!room)
    return res.status(404).json({ message: "Phòng không tồn tại" });

  const isBooked = await Booking.findOne({
    room_id,
    status: { $ne: "cancelled" },
    $or: [
      { start_date: { $lt: end }, end_date: { $gt: start } },
      { start_date: { $gte: start, $lt: end } }
    ]
  });

  if (isBooked)
    return res.status(400).json({ message: "Phòng đã được đặt trong thời gian này" });

  const total_price = days * room.price;

  const booking = await Booking.create({
    user_id,
    room_id,
    start_date: start,
    end_date: end,
    total_price,
    expires_at: new Date(Date.now() + 3600000),
  });

  await sendEmail({
    to: req.user.email,
    subject: "Xác nhận đặt phòng thành công!",
    html: `
      <h2>🛎️ Cảm ơn bạn đã đặt phòng tại HotelBooking!</h2>
      <p>✅ <b>Phòng:</b> ${room.name} - Khách sạn ${room.hotel_id.name}</p>
      <p>📅 <b>Ngày:</b> ${start.toLocaleDateString('vi-VN')} đến ${end.toLocaleDateString('vi-VN')}</p>
      <p>💵 <b>Tổng tiền:</b> ${total_price.toLocaleString()} VND</p>
      <p>💳 <b>Trạng thái thanh toán:</b> ${booking.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}</p>
      <hr/>
      <p>📄 <b>Xem chi tiết đơn phòng tại:</b></p>
      <p><a href="https://hotelbooking.com/my-bookings/${booking._id}">https://hotelbooking.com/my-bookings/${booking._id}</a></p>
      <p>🎉 Chúc bạn có một kỳ nghỉ tuyệt vời!</p>
    `,
  });

  getIO().emit("booking_created", {
    message: `Người dùng ${req.user.id} vừa đặt phòng tại khách sạn!`,
  });

  res.status(201).json({ message: "Đặt phòng thành công", booking });
};

exports.getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user_id: req.user.id }).populate("room_id");
  res.json(bookings);
};

exports.cancelBooking = async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user_id: req.user.id }).populate({
    path: 'room_id',
    populate: { path: 'hotel_id' }
  });

  if (!booking)
    return res.status(404).json({ message: "Không tìm thấy booking" });

  booking.status = "cancelled";
  await booking.save();

  await sendEmail({
  to: req.user.email,
  subject: "Huỷ đơn đặt phòng",
  html: `
    <h3>🚫 Bạn đã huỷ đơn đặt phòng</h3>
    <p>🏨 <b>Khách sạn:</b> ${booking.room_id.hotel_id.name}</p>
    <p>📅 <b>Thời gian:</b> ${booking.start_date.toLocaleDateString('vi-VN')} → ${booking.end_date.toLocaleDateString('vi-VN')}</p>
    <p>🗑️ Đơn của bạn đã được huỷ thành công. Nếu đây là nhầm lẫn, hãy đặt lại tại HotelBooking.</p>
  `,
});

  res.json({ message: "Đã huỷ booking" });
};

exports.payBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (booking.isPaid) {
      return res.status(400).json({ message: 'Booking already paid' });
    }

    booking.isPaid = true;
    booking.paidAt = new Date();
    booking.paymentMethod = req.body.paymentMethod || 'cod';
    booking.status = 'confirmed';

    await booking.save();
    res.json({ message: 'Payment successful', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};