const mongoose = require("mongoose");
const moment = require("moment-timezone");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: () => moment().tz("Asia/Kolkata").toDate(), // Set to Indian Standard Time
  },
});

module.exports = mongoose.model("counter", counterSchema);
