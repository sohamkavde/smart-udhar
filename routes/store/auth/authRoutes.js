var express = require("express");
var router = express.Router();
const asyncHandler = require("../../../middleware/async");
const common = require("../../../helper/common");

const {
  storeRegistration,
  storeProfile,
  storeLogout,
  storeLogin,
} = require("../../../controller/store/auth/storeAuthCTR");

/* GET users listing. */
router.get("/", function (req, res, next) {});

// Public Routes
router.post("/store-register", asyncHandler(storeRegistration));
router.post('/store-login', asyncHandler(storeLogin))

// // Protected Routes
router.get("/profile", asyncHandler(storeProfile));
router.post("/logout", common.tokenmiddleware, asyncHandler(storeLogout));

module.exports = router;
