const mongoose = require("mongoose");
const moment = require("moment-timezone");

const profileSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
    trim: true,
  },
  gstNumber: {
    type: String,
    trim: true,
    default: "",
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  shortBio: {
    type: String,
    trim: true,
    maxlength: 160,
  },
  industry: {
    type: String,
    required: true,
  },
  fbURL: {
    type: String,
    trim: true,
    default: "",
  },
  twitterURL: {
    type: String,
    trim: true,
    default: "",
  },
  linkedInURL: {
    type: String,
    trim: true,
    default: "",
  },
  instagramURL: {
    type: String,
    trim: true,
    default: "",
  },
  websiteURL: {
    type: String,
    trim: true,
    default: "",
  },
  signatureImage: {
    type: String,
    required: false,
  },
  logoImage: {
    type: String,
    required: false,
  },
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "store",
    required: true,
  },
  today_collection: {
    type: Number,
    default: 0,
  },
  total_collection: {
    type: Number,
    default: 0,
  },
  last_reset: {
    type: Date,
    default: () => moment().tz("Asia/Kolkata").startOf("day").toDate(),
  },
  created_at: {
    type: Date,
    default: () => moment().tz("Asia/Kolkata").toDate(),
  },
  updated_at: {
    type: Date,
    default: () => moment().tz("Asia/Kolkata").toDate(),
  },
});

module.exports = mongoose.model("storeProfile", profileSchema);
