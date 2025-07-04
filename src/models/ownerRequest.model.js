const mongoose = require("mongoose");

const ownerRequestSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  hotel_name: String,
  location: String,
  identity_number: String,
  identity_image: String,
  hotel_license: String,
  note: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("OwnerRequest", ownerRequestSchema);
