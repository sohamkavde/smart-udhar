var express = require("express");
var router = express.Router();
const asyncHandler = require("../../../middleware/async");
const common = require("../../../helper/common");

const {
  createProduct,
  updateProduct,
  deleteProduct,
  findProductById,
  getAllProducts
} = require("../../../controller/store/product/storeProductCTR");

// Base route
router.get("/", (req, res) => {
  res.send("Product routes working!");
});

// Protected Product Routes
router.post("/store-product/create", common.tokenmiddleware, asyncHandler(createProduct));
router.get("/store-product/find-all/:store_id/:storeProfile_id", common.tokenmiddleware, asyncHandler(getAllProducts));

router.post("/store-product/delete/:id", common.tokenmiddleware, asyncHandler(deleteProduct));
router.put("/store-product/update/:id", common.tokenmiddleware, asyncHandler(updateProduct));
router.get("/store-product/findBy-id/:id", common.tokenmiddleware, asyncHandler(findProductById));

module.exports = router;
