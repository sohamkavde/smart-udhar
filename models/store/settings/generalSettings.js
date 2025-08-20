const mongoose = require("mongoose");

const GeneralSettingschema = new mongoose.Schema({
  bussinessName: { type: String, trim: true },
  currencyFormate: { type: String, trim: true },
  timezone: { type: String, trim: true },
  language: { type: String, trim: true },
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
});

module.exports = mongoose.model("GeneralSettings", GeneralSettingschema);
