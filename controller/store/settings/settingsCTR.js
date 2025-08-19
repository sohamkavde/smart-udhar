// controller/store/storeBankDetailCTR.js
const path = require("path");
const StoreBankDetail = require(path.join(__dirname,"../../../models/store/settings/settings"));

// Create Bank Detail
exports.createBankDetail = async (req, res) => {
  try {
    const bankDetail = new StoreBankDetail(req.body);
    if(!bankDetail.store_id || !bankDetail.storeProfile_id) {
      return res.status(400).json({
        status: "error",
        message: "Store ID and Store Profile ID are required",
      });
    }
    await bankDetail.save();

    res.status(201).json({
      status: "success",
      message: "Bank detail created successfully",
      data: bankDetail,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Find Bank Detail by ID
exports.findBankDetailById = async (req, res) => {
  try {
    const bankDetail = await StoreBankDetail.findById(req.params.id);

    if (!bankDetail) {
      return res.status(404).json({
        status: "error",
        message: "Bank detail not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: bankDetail,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Find all Bank Details by Store ID
exports.findAllBankDetails = async (req, res) => {
  try {
    const bankDetails = await StoreBankDetail.find({
      _id: req.params.id,
      store_id: req.params.store_id,
      storeProfile_id: req.params.storeProfile_id,
    });

    res.status(200).json({
      status: "success",
      count: bankDetails.length,
      data: bankDetails,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update Bank Detail by ID
exports.updateBankDetail = async (req, res) => {
  try {
    const bankDetail = await StoreBankDetail.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!bankDetail) {
      return res.status(404).json({
        status: "error",
        message: "Bank detail not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Bank detail updated successfully",
      data: bankDetail,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete Bank Detail by ID
exports.deleteBankDetailById = async (req, res) => {
  try {
    const bankDetail = await StoreBankDetail.findByIdAndDelete(req.params.id);

    if (!bankDetail) {
      return res.status(404).json({
        status: "error",
        message: "Bank detail not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Bank detail deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
