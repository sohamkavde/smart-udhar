const mongoose = require("mongoose");
const Counter = require("./counter");
const moment = require("moment-timezone");

const customerSchema = new mongoose.Schema({
  customId: { type: String, unique: true }, // CUST001, etc.
  name: { type: String, default: null },
  mobile: { type: String, default: null },
  email: { type: String, default: null },
  address: { type: String, default: null },
  pin: { type: String, default: null },
  city: { type: String, default: null },
  state: { type: String, default: null },
  aadharCardNumber: { type: String, default: null },
  panNumber: { type: String, default: null },
  companyName: { type: String, default: null },
  gstNumber: { type: String, default: null },
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
    default: () => moment().tz("Asia/Kolkata").toDate(), // Set to Indian Standard Time
  },
   updatedAt: {
    type: Date,
    default: () => moment().tz("Asia/Kolkata").toDate(),
  },
});

// Custom ID generation
customerSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: "customerId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const padded = String(counter.seq).padStart(3, "0");
      this.customId = `CUST${padded}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

customerSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: moment().tz("Asia/Kolkata").toDate() });
  next();
});

module.exports = mongoose.model("customer", customerSchema);
