const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  hotel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  name: String,
  price: Number,
  max_guests: Number,
  amenities: [String],
  images: [String],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Room", roomSchema);