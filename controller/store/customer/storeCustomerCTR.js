const Customer = require("../../../models/store/customer/customer");


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
    if (!name || !mobile || !email || !address || !pin || !city || !state || !aadharCardNumber || !panNumber || !companyName || !gstNumber || !store_id || !storeProfile_id) {
      return res.status(400).json({ success: false, message: "All fields are required" });
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
    return res.status(201).json({ success: true, message: "Customer created successfully", customer });
  } catch (error) {
    console.error("Error creating customer:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const updateCustomer = async (req, res) => {
  try {
    const { customId } = req.body;

    if (!customId) {
      return res.status(400).json({ success: false, message: "customId is required" });
    }

    // Remove customId from update fields to prevent overwriting it
    const { customId: _, ...updateFields } = req.body;

    const updatedCustomer = await Customer.findOneAndUpdate(
      { customId }, // find by customId
      updateFields, // update fields
      { new: true } // return updated document
    );

    if (!updatedCustomer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({ success: true, message: "Customer updated", customer: updatedCustomer });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { customId } = req.params;

    const deletedCustomer = await Customer.findOneAndDelete({ customId });

    if (!deletedCustomer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({ success: true, message: "Customer deleted successfully", customer: deletedCustomer });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const findCustomerById = async (req, res) => {
  try {
    const { customId } = req.params;

    // Find by customId (e.g., CUST001)
    const customer = await Customer.findOne({ customId });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({ success: true, customer });
  } catch (error) {
    console.error("Error finding customer:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort();

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


module.exports = {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    findCustomerById,
    getAllCustomers
}