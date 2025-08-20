var express = require("express");
var router = express.Router();
const asyncHandler = require("../../../middleware/async");
const common = require("../../../helper/common");

const {
    createBankDetail,
  findBankDetailById,  
  updateBankDetail,
  deleteBankDetailById,
} = require("../../../controller/store/settings/settingsCTR");

/* GET base route */
router.get("/", function (req, res) {
  res.send("Payment Setup API is working 🚀");
});

// ✅ Create Payment Setup
router.post(
  "/payment-setup/create",
  common.tokenmiddleware,
  asyncHandler(createBankDetail)
);

// ✅ Get Payment Setup by ID
router.get(
  "/payment-setup/findBy-id/:id",
  common.tokenmiddleware,
  asyncHandler(findBankDetailById)
);

 

// ✅ Delete Payment Setup
router.delete(
  "/payment-setup/delete/:id",
  common.tokenmiddleware,
  asyncHandler(deleteBankDetailById)
);

// ✅ Update Payment Setup
router.put(
  "/payment-setup/update/:id",
  common.tokenmiddleware,
  asyncHandler(updateBankDetail)
);

module.exports = router;
