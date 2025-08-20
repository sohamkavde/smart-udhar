var express = require("express");
var router = express.Router();
const asyncHandler = require("../../../middleware/async");
const common = require("../../../helper/common");

const {
  createInvoiceTemplateSettings,
  updateInvoiceTemplateSettings,
  findInvoiceTemplateSettingsById, 
  deleteInvoiceTemplateSettingsById,
} = require("../../../controller/store/settings/invoiceCustomisation");

/* Base test route */
router.get("/", function (req, res) {
  res.send("Invoice Template Settings API is working 🚀");
});

// ✅ Create
router.post(
  "/invoice-template-settings/create",
  common.tokenmiddleware,
  asyncHandler(createInvoiceTemplateSettings)
);

// ✅ Get by ID
router.get(
  "/invoice-template-settings/findBy-id/:id",
  common.tokenmiddleware,
  asyncHandler(findInvoiceTemplateSettingsById)
);

 
// ✅ Update
router.put(
  "/invoice-template-settings/update/:id",
  common.tokenmiddleware,
  asyncHandler(updateInvoiceTemplateSettings)
);

// ✅ Delete
router.delete(
  "/invoice-template-settings/delete/:id",
  common.tokenmiddleware,
  asyncHandler(deleteInvoiceTemplateSettingsById)
);

module.exports = router;
