const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  total_price: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  expires_at: Date,
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  paymentMethod: { type: String, enum: ['momo', 'paypal', 'cod'], default: 'cod' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);