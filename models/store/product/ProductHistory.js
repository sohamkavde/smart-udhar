const mongoose = require("mongoose");
const moment = require("moment-timezone");

const productHistorySchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
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
  changes: {
    type: Object, // Could also store `before` and `after` separately
    required: true,
  },
  updated_at: {
    type: Date,
    default: () => moment().tz("Asia/Kolkata").toDate(),
  },
});

module.exports = mongoose.model("ProductHistory", productHistorySchema);
