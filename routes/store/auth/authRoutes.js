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
router.post("/store-register", asyncHandler(storeRegistration));
router.post("/store-verification", asyncHandler(storeVerificationByMobileOTP));
router.post('/store-login-otp', asyncHandler(storeLoginOTP))
router.post('/store-login-verify', asyncHandler(storeLoginVerified))

// // Protected Routes
router.get("/profile", common.tokenmiddleware, asyncHandler(storeProfile));
router.post("/logout", common.tokenmiddleware, asyncHandler(storeLogout));

module.exports = router;
