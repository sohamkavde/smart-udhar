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

/* GET users listing. */
router.get("/", function (req, res, next) {});
 

// // Protected Routes
router.post("/store-business-profile/create", common.tokenmiddleware, asyncHandler(createProfile));
router.get("/store-business-profile/findBy-id/:id", common.tokenmiddleware, asyncHandler(findProfileById));
router.get("/store-business-profile/find-all/:id", common.tokenmiddleware, asyncHandler(findAllProfiles));

//delete profile
router.delete("/store-business-profile/delete/:id", common.tokenmiddleware, asyncHandler(deleteProfileById));

//update proofile
router.put("/store-business-profile/update/:id", common.tokenmiddleware, asyncHandler(updateProfile));





module.exports = router;
