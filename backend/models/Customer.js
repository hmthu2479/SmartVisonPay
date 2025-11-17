const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  points: { type: Number},
  phone: { type: String, unique: true, required: true},
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });


module.exports = mongoose.model("Customer", CustomerSchema);
