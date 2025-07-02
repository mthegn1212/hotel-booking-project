const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  max_guests: { type: Number, required: true },
  amenities: [{ type: String }], // wifi, TV, v.v.
  images: [{ type: String }],
  is_available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);