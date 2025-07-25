const Invoice = require("../../../models/store/invoice/invoice");

// Create Invoice
const createInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;

    const newInvoice = await Invoice.create(invoiceData);

    return res.status(201).json({
      status: "success",
      message: "Invoice created successfully",
      data: newInvoice,
    });
  } catch (error) {
    console.error("Create Invoice Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

// Get All Invoices (for logged-in store)
const getAllInvoices = async (req, res) => {
  try {
    const store_id = req.params.store_id;
    const storeProfile_id = req.params.storeProfile_id;

    const invoices = await Invoice.find({ store_id, storeProfile_id }).sort({
      createdAt: -1,
    });
    const totalCount = await Invoice.countDocuments({ store_id, storeProfile_id });

    return res.status(200).json({
      status: "success",
      message: "Invoices fetched successfully",
      total: totalCount,
      data: invoices,
    });
  } catch (error) {
    console.error("Fetch Invoices Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

// Find Invoice by ID
const findInvoiceById = async (req, res) => {
  try {
    const id = req.params.id;
    const _id = id;
    const invoice = await Invoice.findById({ _id });

    if (!invoice) {
      return res
        .status(404)
        .json({ status: "error", message: "Invoice not found" });
    }

    return res.status(200).json({ status: "success", data: invoice });
  } catch (error) {
    console.error("Find Invoice Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

// Update Invoice
const updateInvoice = async (req, res) => {
  try {
    const id = req.params.id;
    const _id = id;
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      { _id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedInvoice) {
      return res
        .status(404)
        .json({ status: "error", message: "Invoice not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Invoice updated successfully",
      data: updatedInvoice,
    });
  } catch (error) {
    console.error("Update Invoice Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

// Delete Invoice
const deleteInvoice = async (req, res) => {
  try {
    const id = req.params.id;
    const _id = id;
    const deletedInvoice = await Invoice.findByIdAndDelete({ _id });

    if (!deletedInvoice) {
      return res
        .status(404)
        .json({ status: "error", message: "Invoice not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Delete Invoice Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

module.exports = {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  findInvoiceById,
  getAllInvoices,
}