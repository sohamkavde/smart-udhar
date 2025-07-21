const mongoose = require("mongoose");
const moment = require("moment-timezone");

const storeSchema = new mongoose.Schema({
  name: { type: String, trim: true }, // user name
  mobile: { type: String, default: "" },
  mobile_otp: { type: String }, // get otp for mobile
  email: {
    type: String,
    required: false,
    trim: true,
    unique: true,
    lowercase: true,
  }, // will updata from dashboard
  email_otp: { type: String }, // get otp for email
  is_verified: { type: Boolean, default: false }, //
  status: { type: String, default: "inactive" },
  social_id: { type: String, default: "" },
  dateOfBirth: { type: String, default: "" },
  lastLogin: { type: Date, default: null },
  roles: { type: String },
  created_at: {
    type: Date,
    default: () => moment().tz("Asia/Kolkata").toDate(), // Set to Indian Standard Time
  },
});

module.exports = mongoose.model("store", storeSchema);
