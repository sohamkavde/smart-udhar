const mongoose = require("mongoose");
const moment = require("moment-timezone");

const storeStaffSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  mobileNumber: { type: String, required: true, trim: true },
  emailId: { type: String, trim: true, lowercase: true },
  address: { type: String, trim: true },
  pinNumber: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  roles: { type: [String], default: [] },
  image: { type: String, default: "" },
  status: { type: String, enum: ["active", "deactive"], default: "active" },
  online: { type: Boolean, default: false },
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "store",
    required: true,
  },
  storeProfile_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "storeProfile",
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => moment().tz("Asia/Kolkata").toDate(),
  },
  updatedAt: {
    type: Date,
    default: () => moment().tz("Asia/Kolkata").toDate(),
  },
});

// Middleware to update updatedAt before save/update
storeStaffSchema.pre("save", function (next) {
  this.updatedAt = moment().tz("Asia/Kolkata").toDate();
  next();
});

storeStaffSchema.pre("findOneAndUpdate", function (next) {
  this._update.updatedAt = moment().tz("Asia/Kolkata").toDate();
  next();
});

module.exports = mongoose.model("StoreStaff", storeStaffSchema);
