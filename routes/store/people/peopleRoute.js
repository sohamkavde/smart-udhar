var express = require("express");
var router = express.Router();
const asyncHandler = require("../../../middleware/async");
const common = require("../../../helper/common");

const {
  createProfile,
  updateProfile,
} = require("../../../controller/store/profile/storeProfileCTR");

/* GET users listing. */
router.get("/", function (req, res, next) {});
 

// // Protected Routes
router.post("/create-profile", common.tokenmiddleware, asyncHandler(createProfile));
router.put("/update-profile/:id", common.tokenmiddleware, asyncHandler(updateProfile));





module.exports = router;
