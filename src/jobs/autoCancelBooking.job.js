// src/utils/autoCancel.js
const User = require("../models/user.model");
const Room = require("../models/room.model");
const Booking = require("../models/booking.model");
const cron = require('node-cron');
const sendEmail = require("../utils/mailer");

// Chạy job mỗi 10 phút
cron.schedule("*/10 * * * *", async () => {
  try {
    const now = new Date();

    // Tìm các booking chưa thanh toán và đã quá hạn
    const expiredBookings = await Booking.find({
      isPaid: false,
      status: "pending",
      expires_at: { $lt: now },
    });

    for (const booking of expiredBookings) {
      booking.status = "cancelled";
      await booking.save();

      // Lấy thông tin user & phòng
      const user = await User.findById(booking.user_id);
      const room = await Room.findById(booking.room_id).populate("hotel_id");

      // Gửi email thông báo tự huỷ
      await sendEmail({
        to: user.email,
        subject: "Đơn phòng đã bị huỷ do quá hạn thanh toán",
        html: `
          <h3>⏰ Đơn đặt phòng quá hạn thanh toán</h3>
          <p>📅 Thời gian giữ phòng đã hết và đơn đặt phòng đã bị huỷ.</p>
          <p>🏨 Khách sạn: ${room.hotel_id.name}</p>
          <p>Phòng: ${room.name}</p>
          <p>Thời gian: ${booking.start_date.toDateString()} → ${booking.end_date.toDateString()}</p>
          <hr/>
          <p>Nếu bạn vẫn muốn đặt phòng, vui lòng đặt lại trên hệ thống.</p>
        `,
      });
    }

    console.log(`[AutoCancel] ${expiredBookings.length} booking đã bị huỷ do quá hạn`);
  } catch (err) {
    console.error("[AutoCancel] Lỗi huỷ booking quá hạn:", err);
  }
});

module.exports = cron;