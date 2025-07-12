const BookingService = require("../../services/booking.service");
const sendEmail = require("../../utils/mailer");
const { getIO } = require("../../socket");

exports.createBooking = async (req, res) => {
  try {
    const booking = await BookingService.createBooking(req.body, req.user);

    await sendEmail({
      to: req.user.email,
      subject: "Xác nhận đặt phòng thành công!",
      html: booking.emailHtml,
    });

    getIO().emit("booking_created", {
      message: `Người dùng ${req.user.id} vừa đặt phòng tại khách sạn!`,
    });

    res.status(201).json({ message: "Đặt phòng thành công", booking });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  const bookings = await BookingService.getBookingsByUser(req.user.id);
  res.json(bookings);
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await BookingService.cancelBooking(req.params.id, req.user);

    await sendEmail({
      to: req.user.email,
      subject: "Huỷ đơn đặt phòng",
      html: booking.emailHtml,
    });

    res.json({ message: "Đã huỷ booking" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.payBooking = async (req, res) => {
  try {
    const booking = await BookingService.payBooking(req.params.id, req.body, req.user);
    res.json({ message: "Payment successful", booking });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};