var express = require("express");
var router = express.Router();
const asyncHandler = require("../../../middleware/async");
const common = require("../../../helper/common");
const uploadStaffImage = require("../../../middleware/staff/uploadImage");
const uploadAndReplaceImage = require("../../../middleware/staff/uploadAndReplaceImage");

const {
  createStaff,
  updateStaff,
  deleteStaff,
  findStaffById,
  getAllStaff,
  findStaffByName,
  findStaffDetails
} = require("../../../controller/store/staff/storeStaffCTR");

/* GET staff listing. */
router.get("/store-staff", function (req, res, next) {
  res.send("Staff route working");
});

// Protected Routes
router.post(
  "/store-staff/create",
  common.tokenmiddleware,
  uploadStaffImage.single("image"),
  asyncHandler(createStaff)
);
router.get(
  "/store-staff/find-all/:store_id/:storeProfile_id",
  common.tokenmiddleware,
  asyncHandler(getAllStaff)
);

router.post(
  "/store-staff/delete/:id",
  common.tokenmiddleware,
  asyncHandler(deleteStaff)
);

router.put(
  "/store-staff/update/:id",
  common.tokenmiddleware,
  uploadAndReplaceImage,
  asyncHandler(updateStaff)
);
router.put(
  "/store-staff/findBy-id/:id",
  common.tokenmiddleware,
  asyncHandler(findStaffById)
);

router.get(
  "/store-staff/findBy-name/:store_id/:storeProfile_id",
  common.tokenmiddleware,
  asyncHandler(findStaffByName)
);

router.get(
  "/store-staff/find-details/:store_id/:storeProfile_id",
  common.tokenmiddleware,
  asyncHandler(findStaffDetails)
);

module.exports = router;
