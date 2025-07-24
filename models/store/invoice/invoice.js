const mongoose = require("mongoose");
const moment = require("moment-timezone");

const productSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  unit: String,
  price: Number,
  tax: Number,
  total: Number,
});

const milestoneSchema = new mongoose.Schema({
  milestoneName: String,
  amount: Number,
  dueDate: Date,
  status: String,
});

const invoiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  balance: { type: Number, default: 0 },
  creditScore: { type: Number, default: 0 },

  products: [productSchema],
  paymentMode: { type: String, enum: ["cash", "debt"], required: true },

  milestones: [milestoneSchema],

  paymentMethod: { type: String },
  transactionId: { type: String }, // UTR/Transaction ID

  deliveryFee: { type: Number, default: 0 },
  packingCharges: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  other: { type: Number, default: 0 },

  note: { type: String },

  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  totalReceived: { type: Number, default: 0 },
  dueBalance: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ["Paid", "Not Paid"],
    default: "Not Paid",
  },

  total: { type: Number, default: 0 },

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

  createdAt: {
    type: Date,
    default: () => moment().tz("Asia/Kolkata").toDate(), // Set to Indian Standard Time
  },
  updatedAt: {
    type: Date,
    default: () => moment().tz("Asia/Kolkata").toDate(), // Set to Indian Standard Time
  }
});

module.exports = mongoose.model("Invoice", invoiceSchema);
