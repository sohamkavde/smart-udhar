const mongoose = require("mongoose");
const moment = require("moment-timezone");
const InvoiceCounter = require("./invoicecnt"); // ✅ correct import

const productSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
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
  paymentMode: String,
  dueDate: Date,
  status: String,
  counted: { type: Boolean, default: false }
});

const invoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, unique: true }, // INV-00001 etc.
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  name: { type: String, required: true },
  phone: String,
  balance: { type: Number, default: 0 },
  creditScore: { type: Number, default: 0 },

  products: [productSchema],
  paymentMode: { type: String, enum: ["cash", "debt"], required: true },
  milestones: [milestoneSchema],

  paymentMethod: String,
  transactionId: String,

  deliveryFee: { type: Number, default: 0 },
  packingCharges: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  other: { type: Number, default: 0 },

  note: String,

  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  totalReceived: { type: Number, default: 0 },
  dueBalance: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ["Paid", "Unpaid", "Partial"], default: "Unpaid" },

  total: { type: Number, default: 0 },

  store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  storeProfile_id: { type: mongoose.Schema.Types.ObjectId, ref: "StoreProfile", required: true },

}, {
  timestamps: { currentTime: () => moment().tz("Asia/Kolkata").toDate() }
});

// Custom invoiceId generation
invoiceSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await InvoiceCounter.findByIdAndUpdate(
        { _id: "invoiceId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const padded = String(counter.seq).padStart(5, "0");
      this.invoiceId = `INV-${padded}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Indexes for performance
invoiceSchema.index({ customerId: 1 });
invoiceSchema.index({ store_id: 1 });
invoiceSchema.index({ invoiceId: 1 }, { unique: true });

module.exports = mongoose.model("Invoice", invoiceSchema);
