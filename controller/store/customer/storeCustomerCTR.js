const mongoose = require("mongoose");
const Customer = require("../../../models/store/customer/customer");
const ExcelJS = require("exceljs");

const createCustomer = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      address,
      pin,
      city,
      state,
      aadharCardNumber,
      panNumber,
      companyName,
      gstNumber,
      store_id,
      storeProfile_id,
    } = req.body;

    // Basic validation (optional)
    if (
      !name ||
      !mobile ||
      !email ||
      !address ||
      !pin ||
      !city ||
      !state ||
      !aadharCardNumber ||
      !panNumber ||
      !companyName ||
      !gstNumber ||
      !store_id ||
      !storeProfile_id
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const customer = new Customer({
      name,
      mobile,
      email,
      address,
      pin,
      city,
      state,
      aadharCardNumber,
      panNumber,
      companyName,
      gstNumber,
      store_id, // Ensure this is a valid ObjectId reference to the store
      // customId will be generated automatically by the pre-save hook
      storeProfile_id,
    });

    await customer.save();
    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid _id is required" });
    }

    // Discard customId and _id from the update object
    const { _id: __, customId: ___, ...updateFields } = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      _id,
      updateFields,
      { new: true }
    );

    if (!updatedCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({
      success: true,
      message: "Customer updated",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const _id = id;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ success: false, message: "Invalid _id" });
    }

    const deletedCustomer = await Customer.findByIdAndDelete(_id);

    if (!deletedCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
      customer: deletedCustomer,
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const findCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const _id = id;
    // Discard customId if passed as a query or param (defensive)
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ success: false, message: "Invalid _id" });
    }

    const customer = await Customer.findById(_id);

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({ success: true, customer });
  } catch (error) {
    console.error("Error finding customer:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const store_id = req.params.store_id;
    const storeProfile_id = req.params.storeProfile_id;
    const customers = await Customer.find({ store_id, storeProfile_id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      total: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const uploadExcelData = async (req, res) => {
  try {
    const inserted = req.excelData;
    if(inserted.length >= 50) {
      return res.status(500).json({ error: "Customer count should be equal or below 50" });
    }
    for (const row of inserted) {
      const customer = new Customer({
        ...row,
      });
      await customer.save(); // Will trigger your pre-save hook
    }
    
    res.status(200).json({
      message: "Data inserted successfully",
      count: inserted.length,
      data: req.excelData,
    });
  } catch (error) {
    console.error("Insert Error:", error);
    res.status(500).json({ error: "Failed to insert data" });
  }
};

module.exports = {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  findCustomerById,
  getAllCustomers,
  uploadExcelData,
  // exportProductsToExcel // Uncomment if you implement this function
};
