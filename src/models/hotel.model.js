const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }], // Mảng URL ảnh
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  is_published: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);