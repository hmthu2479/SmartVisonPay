const mongoose = require("mongoose");

const KioskSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    code: { type: String, required: true},
    location: { type: String },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Kiosk", KioskSchema);
