var express = require("express");
var router = express.Router();
const asyncHandler = require("../../../middleware/async");
const common = require("../../../helper/common");

const {
  storeProfile,
} = require("../../../controller/store/profile/storeProfileCTR");

/* GET users listing. */
router.get("/", function (req, res, next) {});

// Public Routes
// router.post("/store-register", asyncHandler(storeRegistration));

// // Protected Routes
router.post("/update-profile", common.tokenmiddleware, asyncHandler(storeProfile));

module.exports = router;
