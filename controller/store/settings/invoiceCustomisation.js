const InvoiceTemplateSettings = require("../../../models/store/settings/invoiceCustomisation");

// ✅ Create
exports.createInvoiceTemplateSettings = async (req, res) => {
  const data = await InvoiceTemplateSettings.create(req.body);
  res.status(201).json({ success: true, data });
};

// ✅ Update
exports.updateInvoiceTemplateSettings = async (req, res) => {
  const data = await InvoiceTemplateSettings.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!data) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data });
};

// ✅ Find by ID
exports.findInvoiceTemplateSettingsById = async (req, res) => {
  const data = await InvoiceTemplateSettings.findById(req.params.id);
  if (!data) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data });
};

 

// ✅ Delete
exports.deleteInvoiceTemplateSettingsById = async (req, res) => {
  const data = await InvoiceTemplateSettings.findByIdAndDelete(req.params.id);
  if (!data) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, message: "Deleted successfully" });
};
