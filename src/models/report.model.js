const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    target_type: { type: String, enum: ["user", "hotel", "room"], required: true },
    target_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "reviewed"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);