var express = require("express");
var router = express.Router();
const asyncHandler = require("../../../middleware/async");
const common = require("../../../helper/common");

const {
  createGeneralSettings,
  updateGeneralSettings,
  findGeneralSettingsById,
  deleteGeneralSettingsById,
} = require("../../../controller/store//settings/generalSettingCTR");

/* GET base route */
router.get("/", function (req, res) {
  res.send("General Settings API is working 🚀");
});

// ✅ Create General Settings
router.post(
  "/general-settings/create",
  common.tokenmiddleware,
  asyncHandler(createGeneralSettings)
);

// ✅ Get General Settings by ID
router.get(
  "/general-settings/findBy-id/:id",
  common.tokenmiddleware,
  asyncHandler(findGeneralSettingsById)
);

// ✅ Delete General Settings
router.delete(
  "/general-settings/delete/:id",
  common.tokenmiddleware,
  asyncHandler(deleteGeneralSettingsById)
);

// ✅ Update General Settings
router.put(
  "/general-settings/update/:id",
  common.tokenmiddleware,
  asyncHandler(updateGeneralSettings)
);

module.exports = router;
