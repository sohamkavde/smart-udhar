// Create Invoice
const mongoose = require("mongoose");
const path = require("path");

const Invoice = require(path.join(
  __dirname,
  "../../../models/store/invoice/invoice"
));
const Profile = require(path.join(
  __dirname,
  "../../../models/store/profile/profile"
));
const Product = require(path.join(
  __dirname,
  "../../../models/store/product/product"
));
const Lowstock = require(path.join(
  __dirname,
  "../../../models/store/product/lowStockAlert"
));
const Customer = require(path.join(
  __dirname,
  "../../../models/store/customer/customer"
));

const moment = require("moment-timezone");
const PDFDocument = require("pdfkit-table");

const createInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoiceData = req.body;

    // ✅ Validate Customer
    const CustomerDetails = await Customer.findById(
      invoiceData.customerId
    ).session(session);
    if (!CustomerDetails) {
      await session.abortTransaction();
      return res.status(400).json({
        status: "error",
        message: "Customer does not exist",
      });
    }

    const productArr = invoiceData.products || [];

    // ✅ Aggregate requested qty per productId
    const productQtyMap = {};
    for (const product of productArr) {
      if (!product.productId) continue;
      productQtyMap[product.productId] =
        (productQtyMap[product.productId] || 0) + Number(product.qty);
    }

    const arrProductDb = [];

    // ✅ Validate stock for each product
    for (const [productId, totalRequestedQty] of Object.entries(
      productQtyMap
    )) {
      const productFromDb = await Product.findById(productId).session(session);

      if (!productFromDb) {
        await session.abortTransaction();
        return res.status(400).json({
          status: "error",
          message: `Product with ID ${productId} does not exist`,
        });
      }

      if (productFromDb.quantity < totalRequestedQty) {
        await session.abortTransaction();
        return res.status(400).json({
          status: "error",
          message: `Insufficient stock for product ${productFromDb.name}. Available: ${productFromDb.quantity}, Requested: ${totalRequestedQty}`,
        });
      }

     
      

      // ✅ Check low stock alert
      const remainingQty = productFromDb.quantity - totalRequestedQty;
      if (remainingQty <= productFromDb.min_quantity) {
        let lowStockAlert = await Lowstock.findOne({
          productId: productFromDb._id,
          store_id: invoiceData.store_id,
          storeProfile_id: invoiceData.storeProfile_id,
        }).session(session);

        if (!lowStockAlert) {
          await Lowstock.create(
            [
              {
                productId: productFromDb._id,
                productName: productFromDb.name,
                leftProductQty: remainingQty,
                store_id: invoiceData.store_id,
                storeProfile_id: invoiceData.storeProfile_id,
              },
            ],
            { session }
          );
        } else {
          lowStockAlert.leftProductQty = remainingQty;
          await lowStockAlert.save({ session });
        }
      }

      arrProductDb.push({
        product: productFromDb,
        requestedQty: totalRequestedQty,
      });
    }

    // ✅ Payment checks
    if (invoiceData.paymentMode === "cash" && invoiceData.milestones) {
      await session.abortTransaction();
      return res.status(400).json({
        status: "error",
        message: "Milestones are not allowed for cash payments",
      });
    }

    if (
      invoiceData.paymentMode === "debt" &&
      (!invoiceData.milestones || invoiceData.milestones.length === 0)
    ) {
      await session.abortTransaction();
      return res.status(400).json({
        status: "error",
        message: "Milestones are required for debt payments",
      });
    }

    // ✅ 1. Create invoice
    const [newInvoice] = await Invoice.create([invoiceData], { session });

    // ✅ 2. If cash, update store collections
    if (invoiceData.paymentMode === "cash") {
      const storeProfile = await Profile.findById(
        invoiceData.storeProfile_id
      ).session(session);

      if (storeProfile) {
        const today = moment().tz("Asia/Kolkata").startOf("day");

        if (
          !storeProfile.last_reset ||
          moment(storeProfile.last_reset).isBefore(today)
        ) {
          storeProfile.today_collection = 0;
          storeProfile.last_reset = today.toDate();
        }

        storeProfile.today_collection += Number(invoiceData.total || 0);
        storeProfile.total_collection += Number(invoiceData.total || 0);

        await storeProfile.save({ session });
      }
    }

    // ✅ 3. Deduct stock (atomic update)
    for (const { product, requestedQty } of arrProductDb) {
      const updateResult = await Product.updateOne(
        { _id: product._id, quantity: { $gte: requestedQty } },
        { $inc: { quantity: -requestedQty } },
        { session }
      );

      if (updateResult.matchedCount === 0) {
        await session.abortTransaction();
        return res.status(400).json({
          status: "error",
          message: `Failed to update stock for product ${product.name}`,
        });
      }
    }

    // ✅ Commit transaction
    await session.commitTransaction();

    return res.status(201).json({
      status: "success",
      message: "Invoice created successfully",
      data: newInvoice,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Create Invoice Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  } finally {
    session.endSession();
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

// @desc    Do not change any data in milestones except status. every related information will be come from db. Only send status == paid for paid milestones under milestones array object
// @route   PUT /api/invoice/:id/milestones
const paidMilestones = async (req, res) => {
  try {
    const _id = req.params.id;
    const { milestones } = req.body;

    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required",
      });
    }

    if (!Array.isArray(milestones)) {
      return res.status(400).json({
        success: false,
        message: "Milestones must be an array",
      });
    }

    for (const m of milestones) {
      if (!m.status) {
        return res.status(400).json({
          success: false,
          message: "Each milestone must have a status",
        });
      }
      if (typeof m.amount !== "number") {
        return res.status(400).json({
          success: false,
          message: "Each milestone must have a numeric amount",
        });
      }
    }

    // First update milestones and get updated invoice
    const updatedInvoice = await Invoice.findById(_id);

    if (!updatedInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    let mismatches = [];

    if (updatedInvoice.milestones.length !== milestones.length) {
      mismatches.push({
        field: "milestones.length",
        oldValue: updatedInvoice.milestones.length,
        newValue: milestones.length,
      });
    } else {
      updatedInvoice.milestones.forEach((oldM, i) => {
        const newM = milestones[i];
        const oldObj = oldM.toObject ? oldM.toObject() : oldM;

        Object.keys(oldObj).forEach((key) => {
          if (key === "status" || key === "_id") return; // skip status and _id

          let oldVal = oldObj[key];
          let newVal = newM[key];

          // Normalize Dates for accurate comparison
          if (
            (oldVal instanceof Date ||
              new Date(oldVal).toString() !== "Invalid Date") &&
            (newVal instanceof Date ||
              new Date(newVal).toString() !== "Invalid Date")
          ) {
            oldVal = new Date(oldVal).getTime();
            newVal = new Date(newVal).getTime();
          }

          if (String(oldVal) !== String(newVal)) {
            mismatches.push({
              milestoneIndex: i,
              field: key,
              oldValue: oldObj[key],
              newValue: newM[key],
            });
          }
        });
      });
    }

    if (mismatches.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Data mismatch in milestones",
        mismatches,
      });
    }

    // Update milestones in database
    updatedInvoice.milestones = milestones;
    updatedInvoice.updatedAt = new Date();
    await updatedInvoice.save();

    // Debt recovery logic
    if (updatedInvoice.paymentMode === "debt") {
      // Only unpaid before & not counted yet
      const paidMilestones = updatedInvoice.milestones.filter(
        (m) => String(m.status).toLowerCase() === "paid" && !m.counted
      );

      if (paidMilestones.length > 0) {
        const storeProfile = await Profile.findById(
          updatedInvoice.storeProfile_id
        );

        if (storeProfile) {
          const today = moment().tz("Asia/Kolkata").startOf("day");

          // Reset if date changed
          if (
            !storeProfile.last_reset ||
            moment(storeProfile.last_reset).isBefore(today)
          ) {
            storeProfile.today_collection = 0;
            storeProfile.last_reset = today.toDate();
          }

          // Sum up only fresh paid amounts
          const paidAmount = paidMilestones.reduce(
            (sum, m) => sum + (m.amount || 0),
            0
          );

          storeProfile.today_collection += paidAmount;
          storeProfile.total_collection += paidAmount;

          await storeProfile.save();
        }

        // Mark as counted so they won't be added again
        updatedInvoice.milestones.forEach((m) => {
          if (String(m.status || "").toLowerCase() === "paid" && !m.counted) {
            m.counted = true;
          }
        });

        await updatedInvoice.save();
      }
    }

    return res.status(200).json({
      success: true,
      data: updatedInvoice,
    });
  } catch (error) {
    console.error("Update Milestones Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
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
          $or: [
            { "milestones.status": "Paid" },
            { "paymentStatus": "Paid" },
          ],
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

const exportInvoicesPDF = async (req, res) => {
  try {
    const { filterType } = req.query;

    const today = moment().tz("Asia/Kolkata").startOf("day");
    const startOfWeek = moment(today).startOf("week");
    const endOfWeek = moment(today).endOf("week");
    const threeDaysFromNow = moment(today).add(6, "days").endOf("day");

    let matchCondition = {};
    switch (filterType) {
      case "overdue":
        matchCondition = {
          "milestones.dueDate": { $lt: today.toDate() },
          "milestones.status": { $not: /^Paid$/i },
        };
        break;
      case "dueSoon":
        matchCondition = {
          "milestones.dueDate": {
            $gte: today.toDate(),
            $lte: threeDaysFromNow.toDate(),
          },
          "milestones.status": { $not: /^Paid$/i },
        };
        break;
      case "paid":
        matchCondition = {
           $or: [
            { "milestones.status": "Paid" },
            { "paymentStatus": "Paid" },
          ],
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
        matchCondition = {};
    }

    const invoices = await Invoice.find(matchCondition).lean();

    // Create PDF
    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Disposition", 'attachment; filename="invoices.pdf"');
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // Title
    doc.fontSize(18).text("Invoices Report", { align: "center" });
    doc.moveDown();

    // Prepare table rows from JSON
    const tableRows = [];

    invoices.forEach((invoice) => {
      const milestones = invoice.milestones || [];

      milestones.forEach((milestone, index) => {
        const nextMilestone = milestones[index + 1] || null; // next in queue

        tableRows.push([
          invoice.name || "-",
          invoice.phone || "-",
          `Rs. ${milestone.amount || 0}`,
          milestone.dueDate
            ? moment(milestone.dueDate).format("DD MMM YYYY")
            : "-",
          nextMilestone
            ? `Rs. ${nextMilestone.amount} by ${moment(
                nextMilestone.dueDate
              ).format("DD MMM")}`
            : "-",
          milestone.status.toUpperCase() == "Paid".toUpperCase()
            ? "Paid"
            : filterType
            ? filterType.charAt(0).toUpperCase() +
              filterType.slice(1).toLowerCase()
            : "All",
        ]);
      });
    });

    // Table definition
    const table = {
      headers: [
        "Customer Name",
        "Mobile Number",
        "Pending Amount",
        "Due Date",
        "Next Milestone",
        "Status",
      ],
      rows: tableRows,
    };

    // Render table with styling
    await doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
      prepareRow: (row, i) => doc.font("Helvetica").fontSize(10),
      padding: 5,
      columnSpacing: 5,
      width: 520,
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to export PDF" });
  }
};

// Dashboard Export
const dashboardExport = async (req, res) => {
  try {
    const store_id = req.params.store_id;
    const storeProfile_id = req.params.storeProfile_id;
    // Define the match condition based on filterType
    let matchCondition = {};

    // Get year & month from query params (or body/params depending on your design)
    const { year, month } = req.query; // e.g. ?year=2025&month=2

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Please provide both year and month in query parameters",
      });
    }

    // Ensure numeric values
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    // Get start and end of that month
    const startOfMonth = moment(`${yearNum}-${monthNum}`, "YYYY-M")
      .startOf("month")
      .toDate();

    const endOfMonth = moment(`${yearNum}-${monthNum}`, "YYYY-M")
      .endOf("month")
      .toDate();

    matchCondition = {
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      store_id,
      storeProfile_id,
    };

    const invoices = await Invoice.find(matchCondition).lean();
    let totalSum = 0;
    let paidSum = 0;
    let pendingSum = 0;
    let purchaseArr = [];
    let collectionArr = [];

    invoices.map((invoice) => {
      totalSum += invoice.total || 0;
      const status = invoice.paymentMode;
      let checkPaid = true;

      if (status && status.toLowerCase() === "cash") {
        paidSum += invoice.total || 0;
      } else if (status && status.toLowerCase() === "debt") {
        const milestones = invoice.milestones || [];
        if (!milestones || milestones.length === 0) {
          res
            .status(404)
            .json({ status: "error", message: "Milestones not found" });
        }
        milestones.forEach((milestone) => {
          if (milestone.status && milestone.status.toLowerCase() === "paid") {
            paidSum += milestone.amount || 0;
          }
          if (milestone.status && milestone.status.toLowerCase() !== "paid") {
            pendingSum += milestone.amount || 0;
            checkPaid = false;
          }
        });
      }

      purchaseArr.push({
        purchaseDate: moment(invoice.createdAt).format("DD MMM YYYY"),
        purchaseType: "purchase",
        purchaseTotalAmount: invoice.total || 0,
        purchaseInvoiceNumber: invoice.invoiceId,
        purchaseStatus: checkPaid ? "Paid" : "Pending",
      });
      if (
        invoice.paymentStatus &&
        invoice.paymentStatus.toLowerCase() !== "paid"
      ) {
        collectionArr.push({
          ClientName: invoice.name || "Unknown",
          collectionDueDate: invoice.milestones.dueDate
            ? moment(invoice.milestones.dueDate).format("DD MMM YYYY")
            : "N/A",
          collectionTotalAmount: invoice.total || 0,
          clientPhone: invoice.phone || "N/A",
          collectionType: "collection",
          status: invoice.milestones.status ? invoice.milestones.status : "N/A",
          id: invoice._id,
        });
      }
    });
    res.status(200).json({
      status: "success",
      message: "Dashboard data fetched successfully",
      totalInvoice: invoices.length,
      totalSum: totalSum,
      paidSum: paidSum,
      pendingSum: pendingSum,
      purchaseArrlength: purchaseArr.length,
      purchaseArr: purchaseArr,
      collectionArrlength: collectionArr.length,
      collectionArr: collectionArr,
      data: invoices,
    });
  } catch (error) {
    console.error("Dashboard Export Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

module.exports = {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  findInvoiceById,
  getAllInvoices,
  getAllInvoicesOfCustomer,
  paidMilestones,
  filterInvoices,
  exportInvoicesPDF,
  dashboardExport,
};
