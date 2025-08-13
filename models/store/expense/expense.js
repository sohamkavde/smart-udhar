const mongoose = require("mongoose");
const moment = require("moment-timezone");

const expenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  expenseCategory: {
    type: String,
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  vendorName: {
    type: String,
    default: null,
  },
  gstApplicable: {
    type: Boolean,
    required: true,
  },
  paymentMode: {
    type: String,
    enum: ["Cash", "UPI", "Bank"],
    required: true,
  },
  notesOrBill: {
    type: String, // Can be a URL or text
    default: null,
  },
  expenseImage: {
    type: String, // Path or URL to the uploaded image
    default: null,
  },
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
    default: () => moment.tz("Asia/Kolkata").toDate(),
  },
  updatedAt: {
    type: Date,
    default: () => moment.tz("Asia/Kolkata").toDate(),
  },
});

// Middleware to update `updatedAt` on save
expenseSchema.pre("save", function (next) {
  this.updatedAt = moment.tz("Asia/Kolkata").toDate();
  next();
});

module.exports = mongoose.model("Expense", expenseSchema);
