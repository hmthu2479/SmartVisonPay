const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  email: { type: String, unique: true, required: true},
}, { timestamps: true });


module.exports = mongoose.model("User", UserSchema);
