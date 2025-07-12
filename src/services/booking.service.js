const Booking = require("../models/booking.model");
const Room = require("../models/room.model");

const createBooking = async ({ user, room_id, start_date, end_date }) => {
  const start = new Date(start_date);
  const end = new Date(end_date);
  const today = new Date();
  const days = (end - start) / (1000 * 60 * 60 * 24);

  if (start < today || end < today) {
    throw new Error("Không thể đặt phòng trong quá khứ!");
  }
  if (start >= end) {
    throw new Error("Ngày kết thúc phải sau ngày bắt đầu!");
  }
  if (days <= 0) {
    throw new Error("Ngày không hợp lệ");
  }

  const room = await Room.findById(room_id).populate("hotel_id");
  if (!room) {
    throw new Error("Phòng không tồn tại");
  }

  const isBooked = await Booking.findOne({
    room_id,
    status: { $ne: "cancelled" },
    $or: [
      { start_date: { $lt: end }, end_date: { $gt: start } },
      { start_date: { $gte: start, $lt: end } },
    ],
  });

  if (isBooked) {
    throw new Error("Phòng đã được đặt trong thời gian này");
  }

  const total_price = days * room.price;
  const booking = await Booking.create({
    user_id: user.id,
    room_id,
    start_date: start,
    end_date: end,
    total_price,
    expires_at: new Date(Date.now() + 3600000),
  });

  return { booking, room, total_price };
};

const cancelBooking = async (bookingId, userId) => {
  const booking = await Booking.findOne({ _id: bookingId, user_id: userId }).populate({
    path: "room_id",
    populate: { path: "hotel_id" },
  });

  if (!booking) throw new Error("Không tìm thấy booking");

  booking.status = "cancelled";
  await booking.save();

  return booking;
};

const payBooking = async ({ bookingId, userId, role, paymentMethod }) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) throw new Error("Booking not found");
  if (booking.user_id.toString() !== userId && role !== "admin") {
    throw new Error("Unauthorized");
  }
  if (booking.isPaid) {
    throw new Error("Booking already paid");
  }

  booking.isPaid = true;
  booking.paidAt = new Date();
  booking.paymentMethod = paymentMethod || "cod";
  booking.status = "confirmed";

  await booking.save();

  return booking;
};

module.exports = {
  createBooking,
  cancelBooking,
  payBooking,
};