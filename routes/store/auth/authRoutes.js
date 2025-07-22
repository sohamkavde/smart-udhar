var express = require("express");
var router = express.Router();
const asyncHandler = require("../../../middleware/async");
const common = require("../../../helper/common");

const {
  storeRegistration,
  storeVerificationByMobileOTP,
  storeLoginOTP,
  storeLoginVerified,


  storeProfile,
  storeLogout,
} = require("../../../controller/store/auth/storeAuthCTR");

/* GET users listing. */
router.get("/", function (req, res, next) {});

// Public Routes
router.post("/store-auth/register", asyncHandler(storeRegistration));
router.post("/store-auth/verification", asyncHandler(storeVerificationByMobileOTP));
router.post('/store-auth/login-otp', asyncHandler(storeLoginOTP))
router.post('/store-auth/login-verify', asyncHandler(storeLoginVerified))

// // Protected Routes
router.get("/store-auth/profile", common.tokenmiddleware, asyncHandler(storeProfile));
router.post("/store-auth/logout", common.tokenmiddleware, asyncHandler(storeLogout));

module.exports = router;
