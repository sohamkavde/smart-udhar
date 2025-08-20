const GeneralSettings = require("../../../models/store/settings/generalSettings");

// ✅ Create
exports.createGeneralSettings = async (req, res) => {
  try {
    const data = await GeneralSettings.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update
exports.updateGeneralSettings = async (req, res) => {
  try {
    const data = await GeneralSettings.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!data) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Find by ID
exports.findGeneralSettingsById = async (req, res) => {
  try {
    const data = await GeneralSettings.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete
exports.deleteGeneralSettingsById = async (req, res) => {
  try {
    const data = await GeneralSettings.findByIdAndDelete(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
