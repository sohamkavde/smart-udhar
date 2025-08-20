// controller/store/storeBankDetailCTR.js
const path = require("path");
const StoreBankDetail = require(path.join(__dirname,"../../../models/store/settings/settings"));

// Create Bank Detail
const createBankDetail = async (req, res) => {
  try {
    const bankDetail = new StoreBankDetail(req.body);
    console.log("Bank Detail Data:", bankDetail);
    
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
const findBankDetailById = async (req, res) => {
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

 

// Update Bank Detail by ID
const updateBankDetail = async (req, res) => {
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
const deleteBankDetailById = async (req, res) => {
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

module.exports = {
  createBankDetail,
  findBankDetailById,  
  updateBankDetail,
  deleteBankDetailById,
};