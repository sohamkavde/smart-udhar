const Invoice = require("../../../models/store/invoice/invoice");
const Profile = require("../../../models/store/profile/profile");
const moment = require("moment-timezone");
// Create Invoice
const createInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;

    // 1. Create invoice
    const newInvoice = await Invoice.create(invoiceData);

    // 2. If payment mode is cash, update collections
    if (invoiceData.paymentMode === "cash") {
      const storeProfile = await Profile.findById(invoiceData.storeProfile_id);

      if (storeProfile) {
        const today = moment().tz("Asia/Kolkata").startOf("day");

        // Reset if last reset was before today
        if (
          !storeProfile.last_reset ||
          moment(storeProfile.last_reset).isBefore(today)
        ) {
          storeProfile.today_collection = 0;
          storeProfile.last_reset = today.toDate();
        }

        // Add today's collection
        storeProfile.today_collection += Number(invoiceData.total || 0);
        storeProfile.total_collection += Number(invoiceData.total || 0);

        await storeProfile.save();
      }
    }

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

// Get All Invoices (with pagination)
const getAllInvoices = async (req, res) => {
  try {
    const store_id = req.params.store_id;
    const storeProfile_id = req.params.storeProfile_id;

    // Default to page 1 and limit 10 if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch paginated invoices
    const invoices = await Invoice.find({ store_id, storeProfile_id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalCount = await Invoice.countDocuments({
      store_id,
      storeProfile_id,
    });

    return res.status(200).json({
      status: "success",
      message: "Invoices fetched successfully",
      total: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      data: invoices,
    });
  } catch (error) {
    console.error("Fetch Invoices Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

const getAllInvoicesOfCustomer = async (req, res) => {
  try {
    const customerId = req.params.customer_id;
    const store_id = req.params.store_id;
    const storeProfile_id = req.params.storeProfile_id;

    const invoices = await Invoice.find({
      customerId,
      store_id,
      storeProfile_id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      message: "Invoices fetched successfully",
      data: invoices,
    });
  } catch (error) {
    console.error("Fetch Customer Invoices Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

// @desc    Update milestones for a given invoice
// @route   PUT /api/invoice/:id/milestones
const updateMilestones = async (req, res) => {
  const _id = req.params.id;
  const { milestones } = req.body;

  if (!Array.isArray(milestones)) {
    return res
      .status(400)
      .json({ success: false, message: "Milestones must be an array" });
  }

  const updatedInvoice = await Invoice.findByIdAndUpdate(
    _id,
    {
      $set: {
        milestones: milestones,
        updatedAt: moment().tz("Asia/Kolkata").toDate(),
      },
    },
    { new: true }
  );

  if (!updatedInvoice) {
    return res
      .status(404)
      .json({ success: false, message: "Invoice not found" });
  }

  // 2. Apply collection update logic for debt recovery
  if (updatedInvoice.paymentMode === "debt") {
    const paidMilestones = milestones.filter((m) => m.status === "Paid");

    if (paidMilestones.length > 0) {
      const storeProfile = await Profile.findById(
        updatedInvoice.storeProfile_id
      );

      if (storeProfile) {
        const today = moment().tz("Asia/Kolkata").startOf("day");

        // Daily reset check
        if (
          !storeProfile.last_reset ||
          moment(storeProfile.last_reset).isBefore(today)
        ) {
          storeProfile.today_collection = 0;
          storeProfile.last_reset = today.toDate();
        }

        // Add recovered debt amounts
        let paidAmount = paidMilestones.reduce(
          (sum, m) => sum + (m.amount || 0),
          0
        );

        storeProfile.today_collection += paidAmount;
        storeProfile.total_collection += paidAmount;

        await storeProfile.save();
      }
    }
  }

  res.status(200).json({ success: true, data: updatedInvoice });
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

//filter based on due date

const filterInvoices = async (req, res) => {
  try {
    const { filterType } = req.query; // filterType: overdue, dueSoon, paid, thisWeek

    // Get today's date in IST
    const today = moment().tz("Asia/Kolkata").startOf("day");
    const startOfWeek = moment(today).startOf("week");
    const endOfWeek = moment(today).endOf("week");
    const threeDaysFromNow = moment(today).add(6, "days").endOf("day");

    let matchCondition = {};

    switch (filterType) {
      case "overdue":
        matchCondition = {
          "milestones.dueDate": { $lt: today.toDate() },
          "milestones.status": { $ne: "Paid" },
        };
        break;

      case "dueSoon":
        matchCondition = {
          "milestones.dueDate": {
            $gte: today.toDate(),
            $lte: threeDaysFromNow.toDate(),
          },
          "milestones.status": { $ne: "Paid" },
        };
        break;

      case "paid":
        matchCondition = {
          "milestones.status": "Paid",
        };
        break;

      case "thisWeek":
        matchCondition = {
          "milestones.dueDate": {
            $gte: startOfWeek.toDate(),
            $lte: endOfWeek.toDate(),
          },
        };
        break;

      default:
        return res.status(400).json({ error: "Invalid filter type" });
    }

    const invoices = await Invoice.find(matchCondition);

    res.status(200).json({
      status: "success",
      message: "Due Date Invoice fetched successfully",
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  findInvoiceById,
  getAllInvoices,
  getAllInvoicesOfCustomer,
  updateMilestones,
  filterInvoices,
};
