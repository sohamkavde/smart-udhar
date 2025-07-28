const mongoose = require("mongoose");
const moment = require("moment-timezone");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  product_image: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  defualt_quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  unit: {
    type: String,
    required: true,
    trim: true,
  },
  sales_price: {
    type: Number,
    required: true,
  },
  purchase_price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  hsn_number: {
    type: String,
    trim: true,
  },
  tax: {
    type: Number,
    default: 0,
  },
  price_type: {
    type: String, 
    required: true,
  },
  product_type: {
    type: String, 
    required: true,
  },
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  storeProfile_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StoreProfile",
    required: true,
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

// Auto-update `updated_at` on save
productSchema.pre("save", function (next) {
  this.updated_at = moment().tz("Asia/Kolkata").toDate();
  next();
});

// Auto-update `updated_at` on findOneAndUpdate or updateOne
productSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  this.set({ updated_at: moment().tz("Asia/Kolkata").toDate() });
  next();
});

module.exports = mongoose.model("Product", productSchema);
