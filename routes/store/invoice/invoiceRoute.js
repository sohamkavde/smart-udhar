var express = require("express");
var router = express.Router();
const asyncHandler = require("../../../middleware/async");
const common = require("../../../helper/common");

const {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  findInvoiceById,
  getAllInvoices,
  getAllInvoicesOfCustomer,
  updateMilestones,
  filterInvoices,
} = require("../../../controller/store/invoice/storeInvoiceCTR"); // Make sure this path is correct

// Base route
router.get("/", (req, res) => {
  res.send("Invoice routes working!");
});

// Protected Invoice Routes
router.post("/store-invoice/create", common.tokenmiddleware, asyncHandler(createInvoice));
router.get("/store-invoice/find-all/:store_id/:storeProfile_id", common.tokenmiddleware, asyncHandler(getAllInvoices));

router.post("/store-invoice/delete/:id", common.tokenmiddleware, asyncHandler(deleteInvoice));
router.put("/store-invoice/update/:id", common.tokenmiddleware, asyncHandler(updateInvoice));
router.get("/store-invoice/findBy-id/:id", common.tokenmiddleware, asyncHandler(findInvoiceById));
router.get("/store-invoice/findBy-idd", common.tokenmiddleware, asyncHandler(filterInvoices));


// Customer-specific routes
router.get("/store-customer-invoice/find-all/:customer_id/:store_id/:storeProfile_id", common.tokenmiddleware, asyncHandler(getAllInvoicesOfCustomer));
router.put("/store-customer-invoice/update-milestone/:id", common.tokenmiddleware, asyncHandler(updateMilestones));

// Filter invoices based on due date and status 
router.get("/store-customer-invoice/filter-due-milestone", common.tokenmiddleware, asyncHandler(filterInvoices));


module.exports = router;