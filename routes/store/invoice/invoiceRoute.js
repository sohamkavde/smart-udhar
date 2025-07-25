var express = require("express");
var router = express.Router();
const asyncHandler = require("../../../middleware/async");
const common = require("../../../helper/common");

const {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  findInvoiceById,
  getAllInvoices
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

module.exports = router;
