const cron = require('node-cron');
const Booking = require('../models/booking.model');

// Job chạy mỗi 10 phút
cron.schedule('*/10 * * * *', async () => {
  try {
    const now = new Date();

    const expiredBookings = await Booking.updateMany(
      {
        isPaid: false,
        status: 'pending',
        expires_at: { $lt: now },
      },
      {
        status: 'cancelled',
      }
    );

    console.log(`[AutoCancel] ${expiredBookings.modifiedCount} booking đã bị huỷ do quá hạn`);
  } catch (err) {
    console.error('[AutoCancel] Lỗi huỷ booking quá hạn:', err.message);
  }
});