const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    code: { type: String },
    store: {
      type: String,
      required: true,
    },
    kiosk: {
      type: String,
      required: true,
    },
    customer: {
      type: String,
    },
    products: [
      {
        productId: {
          type: String,
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["MOMO", "ZALOPAY"],
      required: true,
    },
    dateTime: { type: String, required: true },
    apptransid: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
