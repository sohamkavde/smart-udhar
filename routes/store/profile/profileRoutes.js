var express = require("express");
var router = express.Router();
const asyncHandler = require("../../../middleware/async");
const common = require("../../../helper/common");

const {
  createProfile,
  updateProfile,
  findProfileById,
  findAllProfiles,
  deleteProfileById,
} = require("../../../controller/store/profile/storeProfileCTR");
const uploadProfile = require("../../../middleware/profile/uploadProfile");
const updateProfileImage = require("../../../middleware/profile/updateProfileImage");

/* GET users listing. */
router.get("/", function (req, res, next) {});

// // Protected Routes
router.post(
  "/store-business-profile/create",
  common.tokenmiddleware,
  uploadProfile.fields([
    { name: "signatureImage", maxCount: 1 },
    { name: "logoImage", maxCount: 1 },
  ]),
  asyncHandler(createProfile)
);
router.get(
  "/store-business-profile/findBy-id/:id",
  common.tokenmiddleware,
  asyncHandler(findProfileById)
);
router.get(
  "/store-business-profile/find-all/:store_id",
  common.tokenmiddleware,
  asyncHandler(findAllProfiles)
);

//delete profile
router.delete(
  "/store-business-profile/delete/:id",
  common.tokenmiddleware,
  asyncHandler(deleteProfileById)
);

//update proofile
router.put(
  "/store-business-profile/update/:id",
  common.tokenmiddleware,
  updateProfileImage,
  asyncHandler(updateProfile)
);


module.exports = router;
