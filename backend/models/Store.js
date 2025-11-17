const mongoose = require("mongoose");
require("../models/Product"); 
require("../models/Kiosk");

const storeSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  kiosks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kiosk",
    },
  ],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Store", storeSchema);
