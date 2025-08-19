const mongoose = require("mongoose");

const lowStockAlertSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Assuming you have a Product model
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    leftProductQty: {
      type: Number, // better than string for quantity
      required: true,
      min: 0,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("lowStockAlert", lowStockAlertSchema);
