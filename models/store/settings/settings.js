const mongoose = require("mongoose");

const paymentSetupSchema = new mongoose.Schema(
  {
    upi_id: { type: String, required: true, trim: true },
    accountHolderName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    ifscCode: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "store", required: true },
    storeProfileId: { type: mongoose.Schema.Types.ObjectId, ref: "storeProfile", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentSetup", paymentSetupSchema);
