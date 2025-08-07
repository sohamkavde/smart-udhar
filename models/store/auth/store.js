const mongoose = require("mongoose");
const moment = require("moment-timezone");

const storeSchema = new mongoose.Schema({
  mobile: { type: String, default: "" },
  mobile_otp: { type: String }, // get otp for mobile
  is_verified: { type: Boolean, default: false },// Since we verify using mobile number each time, is_verified indicates if the store is verified.  
  lastLogin: { type: Date, default: null },
  roles: { type: String,default: null},
  created_at: {
    type: Date,
    default: () => moment().tz("Asia/Kolkata").toDate(), // Set to Indian Standard Time
  },
});

module.exports = mongoose.model("store", storeSchema);
