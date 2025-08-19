var express = require("express");
var router = express.Router();
const asyncHandler = require("../../../middleware/async");
const common = require("../../../helper/common");

const {
  createPaymentSetup,
  updatePaymentSetup,
  findPaymentSetupById,
  findAllPaymentSetups,
  deletePaymentSetupById,
} = require("../../../controller/store/settings/settingsCTR");

/* GET base route */
router.get("/", function (req, res) {
  res.send("Payment Setup API is working 🚀");
});

// ✅ Create Payment Setup
router.post(
  "/payment-setup/create",
  common.tokenmiddleware,
  asyncHandler(createPaymentSetup)
);

// ✅ Get Payment Setup by ID
router.get(
  "/payment-setup/findBy-id/:id",
  common.tokenmiddleware,
  asyncHandler(findPaymentSetupById)
);

// ✅ Get all Payment Setups for a store
router.get(
  "/payment-setup/find-all/:id/:store_id/:storeProfile_id",
  common.tokenmiddleware,
  asyncHandler(findAllPaymentSetups)
);

// ✅ Delete Payment Setup
router.delete(
  "/payment-setup/delete/:id",
  common.tokenmiddleware,
  asyncHandler(deletePaymentSetupById)
);

// ✅ Update Payment Setup
router.put(
  "/payment-setup/update/:id",
  common.tokenmiddleware,
  asyncHandler(updatePaymentSetup)
);

module.exports = router;
