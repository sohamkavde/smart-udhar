const mongoose = require("mongoose");

const InvoiceTemplateSettingsSchema = new mongoose.Schema(
  {
    paperSize: {
      type: String,      
      default: "A4",
      trim: true,
    },

    businessLogo: {
      type: String,
      trim: true,
      default: "", // store URL or file path
    },

    templateTheme: {
      type: String, 
      default: "modern",
      trim: true,
    },

    defaultTerms: {
      type: String,
      trim: true,      
    }, 

    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "store", required: true },
    storeProfileId: { type: mongoose.Schema.Types.ObjectId, ref: "storeProfile", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InvoiceTemplateSettings", InvoiceTemplateSettingsSchema);
